import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import type { DiagnoseResult, Diagnostic } from "../types";

type MastraAgent = { generate: (prompt: string) => Promise<{ text: string }> };

function buildModel() {
  // Priority: Groq → Gemini
  if (process.env.GROQ_API_KEY) {
    const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
    return groq("moonshotai/kimi-k2-instruct-0905");
  }
  if (process.env.GEMINI_API_KEY) {
    const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
    return google("gemini-2.0-flash");
  }
  return null;
}

const SYSTEM_PROMPT = `You are agent-doctor's AI fix assistant — a world-class expert in:

- AI agent architecture: LangChain, CrewAI, AutoGen, Mastra, MCP, LlamaIndex, custom agents
- Production AI agent security: prompt injection, SSRF, secret management, output validation, OWASP Agentic Top 10
- Agent deployment: Docker best practices, Kubernetes, CI/CD pipelines, blue-green deployments, graceful shutdown
- Agent reliability: retry strategies, circuit breakers, max_iterations guards, timeouts, checkpointing, fallbacks
- Agent observability: OpenTelemetry, Langfuse, Langsmith, structured logging, distributed tracing, cost tracking
- Compliance: GDPR, HIPAA, PCI-DSS, AI transparency laws, NIST AI RMF
- Memory backends: Redis TTL/persistence, Pinecone, Chroma, pgvector — connection health, data retention
- LLM providers: OpenAI, Anthropic, Google Gemini, Ollama — token limits, cost optimisation, fallback routing

When given a diagnostic finding:
1. Explain WHY it is dangerous or risky (1-2 sentences, be direct)
2. Provide a concrete, copy-paste code fix in the project's language (TypeScript or Python)
3. Reference the relevant standard or spec if applicable (OWASP, NIST, CWE, etc.)

Be specific, practical, and concise. No filler text.`;

export function createFixAgent(): MastraAgent | null {
  const model = buildModel();
  if (!model) return null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
    const { Agent } = require("@mastra/core/agent") as any;
    return new Agent({
      name: "agent-doctor-fix",
      id: "agent-doctor-fix",
      instructions: SYSTEM_PROMPT,
      model,
    }) as MastraAgent;
  } catch {
    return null;
  }
}

export async function generateFixes(
  result: DiagnoseResult,
  fileSnippets: Map<string, string>
): Promise<Map<string, string>> {
  const agent = createFixAgent();
  if (!agent) return new Map();

  const fixes = new Map<string, string>();

  const toFix: Diagnostic[] = [
    ...result.diagnostics.filter((d) => d.severity === "error"),
    ...result.diagnostics.filter((d) => d.severity === "warn"),
  ]
    .filter((d, i, arr) => arr.findIndex((x) => x.ruleId === d.ruleId) === i)
    .slice(0, 5);

  for (const diag of toFix) {
    const snippet = diag.file ? fileSnippets.get(diag.file) ?? "" : "";
    const context = snippet.slice(0, 1500);

    const prompt = [
      `Project: ${result.projectInfo.framework} / ${result.projectInfo.language}`,
      `Issue: [${diag.ruleId}] ${diag.title}`,
      `File: ${diag.file ?? "N/A"}${diag.line ? ` line ${diag.line}` : ""}`,
      `Suggested remediation: ${diag.remediation}`,
      context ? `\nRelevant code:\n\`\`\`\n${context}\n\`\`\`` : "",
      "\nProvide your fix:",
    ].filter(Boolean).join("\n");

    try {
      const response = await agent.generate(prompt);
      fixes.set(diag.ruleId, response.text);
    } catch {
      // silently skip if AI call fails
    }
  }

  return fixes;
}
