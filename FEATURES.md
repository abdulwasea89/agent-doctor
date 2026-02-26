# Agent-Doctor — Features

> A deep explanation of every feature in Agent-Doctor: how it works, why it exists, and what value it creates.

---

## Table of Contents

1. [Auto Framework Detection](#1-auto-framework-detection)
2. [Two-Pass Analysis Engine](#2-two-pass-analysis-engine)
3. [80+ Audit Rules](#3-80-audit-rules)
4. [Dead Tool Detection](#4-dead-tool-detection)
5. [Health Score (0–100)](#5-health-score-0100)
6. [Markdown Report Output](#6-markdown-report-output)
7. [JSON Report Output](#7-json-report-output)
8. [Rate-Limit Safe Output Separation](#8-rate-limit-safe-output-separation)
9. [--diff Mode (Changed Files Only)](#9---diff-mode-changed-files-only)
10. [--fix Mode (Auto Fix Suggestions)](#10---fix-mode-auto-fix-suggestions)
11. [CI/CD Integration](#11-cicd-integration)
12. [Config File & Rule Ignoring](#12-config-file--rule-ignoring)
13. [JavaScript / TypeScript API](#13-javascript--typescript-api)
14. [MCP Compliance Validation](#14-mcp-compliance-validation)
15. [OWASP Agentic Top 10 Scanning](#15-owasp-agentic-top-10-scanning)

---

## 1. Auto Framework Detection

### What It Does

When you run `agent-doctor .`, the tool scans your project directory before running any checks. It reads your `package.json`, `requirements.txt`, `pyproject.toml`, import statements, and config files to automatically identify:

- **Agent framework** — LangChain, CrewAI, AutoGen, MCP, LlamaIndex, Haystack, or custom
- **Model provider** — OpenAI, Anthropic, Google Gemini, Mistral, local (Ollama), etc.
- **Tool count** — how many tools are registered
- **Memory backend** — Redis, Pinecone, Chroma, in-memory, none
- **MCP compliance** — whether the project follows Model Context Protocol standards

### How It Works

```
project/
  ├── requirements.txt         → detects "langchain" → framework = LangChain
  ├── .env                     → detects "OPENAI_API_KEY" → provider = OpenAI
  ├── agent/tools/             → counts 6 .py files → toolCount = 6
  └── agent-doctor.config.json → reads user overrides
```

Detection uses pattern matching across file names, dependency declarations, and import signatures. If detection is ambiguous, it defaults to `custom` mode and applies general rules only.

### Why It Matters

Without this, every team would need to configure the tool manually for their specific stack. Auto-detection means you can run `agent-doctor .` in any agent project and get relevant results immediately — no configuration required for most setups.

### Value Created

- Zero-config onboarding for new projects
- Framework-specific rules are applied automatically (LangChain projects don't get AutoGen-specific warnings)
- Faster adoption across polyglot teams

---

## 2. Two-Pass Analysis Engine

### What It Does

Agent-Doctor runs two completely separate analysis passes against your project — simultaneously, so they don't add to total runtime.

- **Pass 1 — Audit:** Static analysis of 80+ rules across 6 categories
- **Pass 2 — Dead Tools:** Structural analysis to find unused or unreachable agent components

### How It Works

```
agent-doctor .
      |
      +──── Pass 1: Audit engine       ──┐
      |     (rules engine, static scan)  │ run in parallel
      +──── Pass 2: Dead tool scanner  ──┘
                                          |
                              Results merged into report
```

Both passes share the same parsed project representation (AST, config trees, dependency graph) so there's no duplicate file reading.

### Why It Matters

These two concerns are different in nature. Audit finds *dangerous* things (security holes, misconfigs, compliance gaps). Dead tool detection finds *wasteful or broken* things (tools that are registered but never called, memory backends configured but disconnected). Separating them keeps results organized and actionable.

### Value Created

- Cleaner, categorized issue lists
- Teams can act on security issues and cleanup issues separately
- Parallel execution keeps scan time under 3 seconds on most projects

---

## 3. 80+ Audit Rules

### What It Does

The audit engine checks your project against over 80 rules organized into 6 categories: Security, Configuration, Deployment, Reliability, Observability, and Compliance.

### How It Works

Each rule is a self-contained module:

```ts
export const sec001: Rule = {
  id: "SEC-001",
  category: "security",
  severity: "error",
  description: "Prompt injection risk detected in tool input",

  check(context: RuleContext): Diagnostic[] {
    // Scans tool input handlers for unsanitized user content
    // Returns list of file locations where risk is detected
  }
};
```

Rules are toggled based on framework detection. A project using MCP gets MCP-specific protocol compliance rules. A LangChain project gets chain-specific checks. Rules that don't apply are silently skipped — you only see what's relevant.

### Why It Matters

Most agent security and reliability issues are well-known patterns — prompt injection, unconstrained tool access, missing error handling, no logging. Encoding these as rules means teams don't need to manually audit every deployment. The tool does it automatically, every time.

### Value Created

- Encodes years of hard-won deployment knowledge into automated checks
- Prevents common production failures before they happen
- New rules can be added by the community over time, growing the ruleset with the industry

---

## 4. Dead Tool Detection

### What It Does

Scans your agent project for tool registrations, memory configurations, and agent branches that are defined but never actually used at runtime.

Examples of what it catches:

- A tool registered in `tools/` but never imported or called by any agent
- A memory backend configured in `.env` but the agent never writes to or reads from it
- An agent branch (conditional path) that is logically unreachable given current routing config

### How It Works

Dead tool detection builds a **call graph** from your agent entry point:

```
main.py (entry)
  └── AgentExecutor
        ├── web_search_tool     ← called ✔
        ├── calculator_tool     ← called ✔
        └── email_tool          ← registered but never called ✘ DEAD
```

It traces imports, tool registrations, and call sites. Anything in the registered tool list that never appears in a call site is flagged as dead.

### Why It Matters

Dead tools increase the agent's attack surface. An AI model can hallucinate calls to tools that exist in its context but shouldn't be reachable. Dead tools also add confusion and maintenance overhead — developers inherit them without knowing whether they're intentional.

### Value Created

- Reduces attack surface by exposing unnecessary tool registrations
- Keeps agent definitions clean and intentional
- Flags configuration drift (tool was removed from code but not from config)

---

## 5. Health Score (0–100)

### What It Does

Produces a single **0–100 score** summarizing your agent's production readiness, broken into 6 weighted dimensions:

| Dimension     | Weight |
|---------------|--------|
| Security      | 25%    |
| Reliability   | 20%    |
| Configuration | 20%    |
| Deployment    | 15%    |
| Observability | 10%    |
| Compliance    | 10%    |

### How It Works

Each rule contributes a penalty when it fires. Errors deduct more than warnings. The raw penalty sum is normalized to a 0–100 score per dimension, then combined using the weights above.

```
Security dimension:
  SEC-001 fired (error)   → -8 pts
  SEC-004 fired (warning) → -3 pts
  Raw: 14 / 25

Final score:
  (14/25 * 0.25) + (17/20 * 0.20) + ... = 64 / 100
```

### Why It Matters

A single number lets teams set gates. "We don't ship below 75" is a clear, enforceable policy. Without a score, teams get a list of issues with no clear sense of overall severity.

### Value Created

- Makes deployment decisions objective and consistent
- Enables CI/CD hard gates (`--threshold 80`)
- Lets teams track improvement over time (score goes up as issues are fixed)
- Score labels (Great / Needs work / Critical) give instant context without reading the full report

---

## 6. Markdown Report Output

### What It Does

Generates `agent-doctor-report.md` — a human-readable report designed to be read in GitHub PRs, Notion, Obsidian, or any markdown viewer.

### How It Works

```bash
agent-doctor .
# Writes: agent-doctor-report.md  (default)
```

The markdown report includes:
- Agent metadata (name, framework, model, date)
- Score summary table with per-dimension breakdown
- Issues grouped by severity (errors first, then warnings)
- File paths and line numbers as inline code
- Remediation notes for each issue

### Why It Matters

Developers live in GitHub and their editors. A markdown report fits naturally into a PR review — it can be posted as a comment, committed to the repo, or read directly in the file viewer. JSON is for machines; markdown is for humans.

### Value Created

- Zero-friction sharing of audit results across teams
- Can be auto-posted to GitHub PR comments in CI
- Works offline, in any viewer, forever — no dashboard dependency
- Readable by non-engineers (PMs, security reviewers) without tooling

---

## 7. JSON Report Output

### What It Does

Generates `agent-doctor-report.json` — a machine-readable, structured audit report for programmatic consumption.

### How It Works

```bash
agent-doctor . --output json
# Writes: agent-doctor-report.json
```

The JSON report includes the full score object, all diagnostics with rule IDs, severities, file paths, line numbers, and remediation strings — everything needed to build downstream tooling.

### Why It Matters

Teams building dashboards, compliance tracking systems, or custom alerting need structured data. The JSON format is stable and versioned, so tooling built on top of it doesn't break between Agent-Doctor releases.

### Value Created

- Powers custom dashboards and monitoring
- Enables score tracking over time in CI artifacts
- Feeds into compliance reporting workflows
- Can be ingested by security tooling, SIEMs, or data warehouses

---

## 8. Rate-Limit Safe Output Separation

### What It Does

Agent-Doctor enforces a strict rule: **markdown and JSON reports cannot be generated in the same run.** You choose one format per invocation.

```bash
# These cannot be combined:
agent-doctor . --output md    # Step 1
agent-doctor . --output json  # Step 2 (separate run)
```

### How It Works

When `--fix` is enabled, Agent-Doctor calls an LLM to generate specific remediation suggestions for each issue. If two report formats were generated in the same run, this would double the LLM API calls — potentially hitting rate limits on shared infrastructure or API plans.

By separating formats into distinct runs, each run stays within a predictable token budget. The audit itself (without `--fix`) has no rate limit concern and runs entirely locally.

### Why It Matters

Rate limiting is a real problem in CI pipelines that run on every commit. A tool that silently hits rate limits and produces partial reports is worse than one that produces no report at all. Separating formats prevents this class of failure.

### Value Created

- Predictable, reliable CI behavior
- No silent partial failures from rate limit exhaustion
- Each format run is independently cacheable and retryable
- Teams can schedule MD and JSON runs at different frequencies (e.g., MD on every PR, JSON nightly)

---

## 9. --diff Mode (Changed Files Only)

### What It Does

When run with `--diff [base]`, Agent-Doctor only audits files that have changed relative to a base branch — typically `main`.

```bash
agent-doctor . --diff main
```

### How It Works

Agent-Doctor runs `git diff --name-only <base>` to get the list of changed files, then restricts both the audit pass and dead tool detection to those files only. The health score is reported as a **delta** — how many new issues were introduced by this change.

### Why It Matters

On large agent projects with hundreds of files, a full audit on every commit is expensive and noisy. Most of the issues found will be pre-existing. `--diff` focuses the signal on what *this PR* introduced.

### Value Created

- Fast PR-level feedback (runs in milliseconds on small diffs)
- Reviewers see only new issues, not pre-existing backlog
- Teams can adopt Agent-Doctor without first fixing all existing issues
- Enables a "no regressions" policy without a "fix everything" requirement

---

## 10. --fix Mode (Auto Fix Suggestions)

### What It Does

When run with `--fix`, Agent-Doctor sends each detected issue to an LLM and returns specific, copy-paste-ready code or config fixes.

```bash
agent-doctor . --fix
```

### How It Works

For each diagnostic, Agent-Doctor constructs a prompt containing:
- The rule that fired
- The file and line number
- The surrounding code context (5 lines before/after)
- The remediation guidance from the rule definition

The LLM returns a suggested fix, which is appended to the report under each issue. Fixes are suggestions — they are never applied automatically without user confirmation.

### Why It Matters

Finding issues is only half the value. A junior developer seeing "Prompt injection risk detected in tool input" may not know what to do next. `--fix` bridges the gap between detection and resolution.

### Value Created

- Dramatically reduces time from "issue found" to "issue fixed"
- Lowers the barrier for developers unfamiliar with agent security patterns
- Each fix is contextual to the actual code, not a generic template
- Accelerates security remediation cycles

---

## 11. CI/CD Integration

### What It Does

Agent-Doctor is designed to run inside CI/CD pipelines as a quality gate. It supports GitHub Actions, GitLab CI, and any system that can run shell commands.

### How It Works

The `--score` flag exits with a non-zero code if the score is below the threshold:

```bash
agent-doctor . --score --threshold 80
# Exit code 0 if score >= 80
# Exit code 1 if score < 80 (fails the pipeline)
```

In GitHub Actions, this causes the job to fail and blocks the PR from merging.

### Why It Matters

CI/CD gates are the only enforcement mechanism that actually works at scale. Code review is inconsistent. Checklists get skipped. A hard gate that fails the build cannot be ignored.

### Value Created

- Makes agent quality a hard requirement, not a soft suggestion
- Catches regressions before they reach production
- Creates a consistent, auditable record of agent health over time
- Enables compliance teams to verify checks were run on every deployment

---

## 12. Config File & Rule Ignoring

### What It Does

Teams can suppress specific rules or exclude specific file paths from analysis using a local config file.

```json
{
  "ignore": {
    "rules": ["DEP-001", "OBS-003"],
    "files": ["src/generated/**", "tests/**"]
  }
}
```

### How It Works

The config is read at startup. Any rule in the `ignore.rules` list is skipped entirely and does not appear in the report. Files matching patterns in `ignore.files` are excluded from both passes.

The config can live in `agent-doctor.config.json` or inside `package.json` under the `"agentDoctor"` key.

### Why It Matters

No rule engine is perfect for every context. Some rules are irrelevant to certain architectures. Some files (generated code, test fixtures) should never be audited. Without ignore support, teams either accept noisy reports or stop using the tool entirely.

### Value Created

- Reduces false positives and noise
- Lets teams adopt Agent-Doctor incrementally (ignore legacy issues, fix new ones)
- Makes the tool adaptable to non-standard architectures
- `package.json` integration means one fewer config file for most projects

---

## 13. JavaScript / TypeScript API

### What It Does

Agent-Doctor ships a programmatic API so teams can embed diagnostics directly into their own tooling, editors, or dashboards.

```ts
import { diagnose } from "agent-doctor/api";

const result = await diagnose("./agents/support-bot");
```

### How It Works

The `diagnose()` function runs the same two-pass engine as the CLI and returns a structured result object. It accepts the same options as the CLI flags.

### Why It Matters

Not every team wants a CLI. Some teams build internal developer portals, VS Code extensions, or custom deployment pipelines. The API lets them embed agent health diagnostics exactly where they need it, with full programmatic control over the output.

### Value Created

- Enables custom tooling built on top of Agent-Doctor
- Powers VS Code and editor integrations
- Allows score-aware deployment automation without shell scripting
- Supports teams that need to aggregate health scores across many agent projects

---

## 14. MCP Compliance Validation

### What It Does

For projects using the Model Context Protocol (MCP), Agent-Doctor validates that tool schemas, server configurations, and client registrations conform to the MCP specification.

### How It Works

Agent-Doctor reads your MCP tool manifest and checks:
- Tool schemas match the required JSON Schema format
- Server capability declarations are valid
- Client tool registrations reference existing server tools
- Protocol version compatibility is maintained

Non-compliance is flagged as `CFG-004` with a specific description of which field or schema is invalid.

### Why It Matters

MCP is becoming an industry standard for interoperable AI tool use. Misconfigured MCP setups silently fail — the agent simply doesn't have access to the tools it thinks it has. Catching this statically saves hours of debugging.

### Value Created

- Ensures MCP-based agents are actually connected to the tools they're configured to use
- Validates interoperability before deployment
- Keeps projects up-to-date with evolving MCP spec requirements
- Reduces MCP adoption friction for teams new to the protocol

---

## 15. OWASP Agentic Top 10 Scanning

### What It Does

Agent-Doctor includes a dedicated scanner for the OWASP Top 10 for Agentic Applications — the industry's emerging standard for AI agent security vulnerabilities.

### How It Works

Each OWASP Agentic risk category maps to one or more Agent-Doctor rules:

| OWASP Risk | Agent-Doctor Rule | What It Checks |
|------------|-------------------|----------------|
| A01 — Prompt Injection | SEC-001 | Unsanitized user input passed to tools |
| A02 — Excessive Agency | SEC-003 | Tools with destructive access, no guardrails |
| A03 — Memory Poisoning | SEC-006 | Untrusted data written to persistent memory |
| A04 — Supply Chain | SEC-007 | Unverified tool sources or plugin registries |
| A05 — Insufficient Logging | SEC-004 | No audit trail on tool calls |
| A06 — Data Leakage | SEC-008 | PII or secrets in tool outputs |

### Why It Matters

The OWASP Agentic Top 10 represents the community's best current understanding of how AI agents fail in production — from a security standpoint. Aligning to it means Agent-Doctor's rules are grounded in real attack patterns, not hypothetical concerns.

### Value Created

- Provides a recognized, auditable security baseline
- Enables compliance teams to verify OWASP coverage in their agent stack
- Keeps Agent-Doctor aligned with evolving industry security standards
- Gives security reviewers a familiar framework for evaluating agent audit results

---

> For questions, feature requests, or rule contributions, open an issue or PR on GitHub.