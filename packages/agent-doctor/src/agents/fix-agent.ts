// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Agent } = require("@mastra/core/agent") as { Agent: new (cfg: Record<string, unknown>) => { generate: (prompt: string) => Promise<{ text: string }> } };
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import type { DiagnoseResult, Diagnostic } from "../types";

// Build the LLM — prefer Anthropic, fall back to OpenAI
function buildModel() {
  if (process.env.ANTHROPIC_API_KEY) {
    const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    return anthropic("claude-opus-4-6");
  }
  if (process.env.OPENAI_API_KEY) {
    const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
    return openai("gpt-4o");
  }
  return null;
}

const SYSTEM_PROMPT = `You are agent-doctor's AI fix assistant — an expert in:

- AI agent architecture (LangChain, CrewAI, AutoGen, Mastra, MCP, LlamaIndex)
- Production AI agent security: prompt injection, SSRF, secret management, output validation
- Agent deployment: Docker, Kubernetes, CI/CD, blue-green, graceful shutdown
- Agent reliability: retries, circuit breakers, max_iterations, timeouts, checkpointing
- Agent observability: OpenTelemetry, Langfuse, Langsmith, structured logging, tracing
- Compliance: OWASP Agentic Top 10, GDPR, HIPAA, PCI-DSS, AI transparency
- Memory backends: Redis, Pinecone, Chroma, pgvector — TTL, persistence, health checks
- Model providers: OpenAI, Anthropic, Google, Ollama — cost tracking, fallbacks, token limits

When given a diagnostic finding, you:
1. Explain WHY it is a problem in 1-2 sentences
2. Give a concrete code fix (TypeScript or Python depending on the project)
3. Link to the relevant best practice or spec (OWASP, NIST, etc.) if applicable

Be specific, practical, and brief. No fluff. Do not repeat the issue title.`;

export function createFixAgent(): ReturnType<typeof Agent> | null {
  const model = buildModel();
  if (!model) return null;

  return new Agent({
    name: "agent-doctor-fix",
    id: "agent-doctor-fix",
    instructions: SYSTEM_PROMPT,
    model,
  });
}

export async function generateFixes(
  result: DiagnoseResult,
  fileSnippets: Map<string, string>
): Promise<Map<string, string>> {
  const agent = createFixAgent();
  if (!agent) {
    return new Map();
  }

  const fixes = new Map<string, string>();

  // Only fix errors and top warnings (limit to 5 to control cost)
  const toFix: Diagnostic[] = [
    ...result.diagnostics.filter((d) => d.severity === "error"),
    ...result.diagnostics.filter((d) => d.severity === "warn"),
  ]
    .filter((d, i, arr) => arr.findIndex((x) => x.ruleId === d.ruleId) === i) // unique by rule
    .slice(0, 5);

  for (const diag of toFix) {
    const snippet = diag.file ? fileSnippets.get(diag.file) ?? "" : "";
    const truncated = snippet.slice(0, 1500); // keep context small

    const prompt = `
Project: ${result.projectInfo.framework} / ${result.projectInfo.language}
Issue: [${diag.ruleId}] ${diag.title}
File: ${diag.file ?? "N/A"}${diag.line ? ` line ${diag.line}` : ""}
Suggested remediation: ${diag.remediation}

${truncated ? `Relevant code:\n\`\`\`\n${truncated}\n\`\`\`` : ""}

Please provide a fix.`.trim();

    try {
      const response = await agent.generate(prompt);
      fixes.set(diag.ruleId, response.text);
    } catch {
      // silently skip if AI fails
    }
  }

  return fixes;
}
