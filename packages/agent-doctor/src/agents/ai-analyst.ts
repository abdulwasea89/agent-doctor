import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import type { Diagnostic, AiAnalysis, AiVerification, Category } from "../types";

function buildModel() {
  if (process.env.GROQ_API_KEY) {
    const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
    return { model: groq("moonshotai/kimi-k2-instruct-0905"), name: "kimi-k2-instruct" };
  }
  if (process.env.GEMINI_API_KEY) {
    const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
    return { model: google("gemini-2.0-flash"), name: "gemini-2.0-flash" };
  }
  return null;
}

// Build a single consolidated prompt for ALL diagnostics + real file content
function buildConsolidatedPrompt(
  diagnostics: Diagnostic[],
  files: Map<string, string>
): string {
  // List every real file that exists in the scanned project
  const realFileList = Array.from(files.keys()).join("\n");

  // Include full content of every scanned file (up to 3000 chars each)
  const fileSnippets: string[] = [];
  for (const [filePath, content] of files) {
    const truncated = content.length > 3000 ? content.slice(0, 3000) + "\n...(truncated)" : content;
    fileSnippets.push(`FILE: ${filePath}\n---\n${truncated}\n---`);
  }

  // Group diagnostics by category for clarity
  const grouped: Partial<Record<Category, Diagnostic[]>> = {};
  for (const d of diagnostics) {
    if (!grouped[d.category]) grouped[d.category] = [];
    grouped[d.category]!.push(d);
  }

  const diagsText = Object.entries(grouped)
    .map(([cat, diags]) => `[${cat.toUpperCase()}]\n${JSON.stringify(diags, null, 2)}`)
    .join("\n\n");

  return `You are an exhaustive AI agent code auditor analyzing a real project.

CRITICAL RULES — you MUST follow these or your output is invalid:
- The ONLY files that exist in this project are listed below under "REAL FILES".
- NEVER reference, invent, or hallucinate file paths that are not in that list.
- If a new finding has a "file" field, it MUST be one of the real files listed below, or omit the "file" field entirely.
- Do NOT invent src/config.ts, src/exec.ts, src/api.ts or any file not in the list.

REAL FILES IN THIS PROJECT:
${realFileList}

${fileSnippets.length > 0 ? "FILE CONTENTS:\n" + fileSnippets.join("\n\n") + "\n\n" : ""}STATIC FINDINGS (${diagnostics.length} total):
${diagsText}

YOUR TASKS:
1. VERIFY each static finding: is it real based on the actual file contents above, or a false-positive?
2. DEEP SCAN the actual file contents: find real issues the static rules missed
3. For every finding give a CONCRETE suggestion (real code snippet or exact command)

Respond with JSON only (no markdown, no explanation):
{
  "verifications": [{ "ruleId": "...", "confirmed": true, "reason": "one sentence referencing actual code" }],
  "newFindings": [{ "ruleId": "AI-001", "severity": "error", "category": "security", "title": "...", "file": "<only a real file from the list above, or omit>", "line": 0, "remediation": "...", "suggestion": "concrete code" }],
  "suggestions": [{ "ruleId": "...", "suggestion": "concrete code or command" }],
  "summary": "2-3 sentence assessment based only on what you actually saw in the files"
}`;
}

export async function runAiAnalysis(
  diagnostics: Diagnostic[],
  files: Map<string, string>
): Promise<AiAnalysis | null> {
  const m = buildModel();
  if (!m) return null;
  if (diagnostics.length === 0) return null;

  const prompt = buildConsolidatedPrompt(diagnostics, files);

  let parsed: {
    verifications?: AiVerification[];
    newFindings?: Diagnostic[];
    suggestions?: Array<{ ruleId: string; suggestion: string }>;
    summary?: string;
  } = { verifications: [], newFindings: [], suggestions: [], summary: "" };

  let totalTokens = 0;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await generateText({ model: m.model as any, prompt, maxTokens: 4096 });
    totalTokens = res.usage?.totalTokens ?? 0;
    const text = res.text.trim().replace(/^```json\n?/, "").replace(/\n?```$/, "");
    parsed = JSON.parse(text);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    process.stderr.write(`\n  [AI] warning: ${msg.slice(0, 120)}\n`);
  }

  const verifications: AiVerification[] = Array.isArray(parsed.verifications) ? parsed.verifications : [];
  const newFindings: Diagnostic[] = Array.isArray(parsed.newFindings)
    ? parsed.newFindings.filter((f) => f.ruleId?.startsWith("AI-"))
    : [];
  const suggestionsMap = new Map<string, string>();
  if (Array.isArray(parsed.suggestions)) {
    for (const s of parsed.suggestions) {
      if (s.ruleId && s.suggestion) suggestionsMap.set(s.ruleId, s.suggestion);
    }
  }

  const confirmedCount = verifications.filter((v) => v.confirmed).length;
  const dismissedCount = verifications.filter((v) => !v.confirmed).length;

  return {
    verifications,
    adjustments: [],
    additionalFindings: newFindings,
    summary: parsed.summary ?? "",
    tokensUsed: totalTokens,
    modelUsed: m.name,
    confirmedCount,
    dismissedCount,
    _suggestions: Object.fromEntries(suggestionsMap),
  } as AiAnalysis & { _suggestions: Record<string, string> };
}

export function applyAiAnalysis(
  diagnostics: Diagnostic[],
  analysis: AiAnalysis,
  realFiles?: Set<string>
): Diagnostic[] {
  const ext = analysis as AiAnalysis & { _suggestions?: Record<string, string> };
  const suggestions = ext._suggestions ?? {};

  // Filter out confirmed false-positives
  const dismissedRuleIds = new Set(
    analysis.verifications.filter((v) => !v.confirmed).map((v) => v.ruleId)
  );

  const confirmed = diagnostics.filter((d) => !dismissedRuleIds.has(d.ruleId));

  // Attach suggestions
  const withSuggestions = confirmed.map((d) => {
    const suggestion = suggestions[d.ruleId] ?? d.suggestion;
    return suggestion ? { ...d, suggestion } : d;
  });

  // Only accept AI findings that:
  // 1. Have ruleId starting with "AI-"
  // 2. Either have no file field, OR reference a real file
  const extra = analysis.additionalFindings.filter((f) => {
    if (!f.ruleId.startsWith("AI-")) return false;
    if (f.file && realFiles && !realFiles.has(f.file)) return false;
    return true;
  });

  return [...withSuggestions, ...extra];
}
