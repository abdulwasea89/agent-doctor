# Agent-Doctor

> Diagnose and harden your AI agents before they hit production.

Agent-Doctor detects your agent framework (LangChain, CrewAI, AutoGen, MCP, etc.), scans your configuration, tools, and deployment setup, then runs two analysis passes in parallel:

- **Audit:** Checks 80+ rules across security, configuration, deployment, reliability, observability, and compliance. Rules are toggled automatically based on your project setup.
- **Dead tools:** Detects unused tool registrations, orphaned memory configs, and unreachable agent branches.

Diagnostics are filtered through your config, then scored by severity — errors weigh more than warnings — to produce a **0–100 health score** (`75+` Great, `50–74` Needs work, `<50` Critical).

Supports **Cursor, Claude Code, Amp Code, Codex, Gemini CLI, OpenCode, Windsurf**, and more.

---

## Install

```bash
npm install -g agent-doctor
```

or

```bash
pip install agent-doctor
```

---

## Usage

```
agent-doctor [directory] [options]

Options:
  -v, --version          display the version number
  --no-audit             skip audit checks
  --no-dead-tools        skip dead tool detection
  --verbose              show file details per rule
  --score                output only the score
  -y, --yes              skip prompts, scan all workspace agents
  --project <n>          select workspace project (comma-separated for multiple)
  --diff [base]          scan only files changed vs base branch
  --fix                  open auto-fix suggestions for all issues
  --output <format>      output format: md (default) or json
  -h, --help             display help for command
```

> **Note:** `--output md` and `--output json` cannot be used at the same time. Generate one per run to avoid rate limiting on LLM-assisted fix suggestions.

### Examples

```bash
# Audit current directory (outputs markdown report by default)
agent-doctor .

# Audit a specific agent project
agent-doctor ./agents/support-bot

# Output as JSON (separate run — not combined with md)
agent-doctor . --output json

# Output score only (great for CI)
agent-doctor . --score

# Scan only changed files against main
agent-doctor . --diff main

# Skip dead tool detection
agent-doctor . --no-dead-tools

# Verbose output per rule
agent-doctor . --verbose
```

---

## Output Formats

Agent-Doctor generates **one report format per run**. This is intentional — combining formats in a single run can trigger rate limits on LLM-powered fix suggestions.

### Markdown (default)

```bash
agent-doctor .
# Writes: agent-doctor-report.md
```

The markdown report is readable in GitHub, Notion, Obsidian, or any editor. It includes a summary table, issue list with file links, and a health score badge.

### JSON

```bash
agent-doctor . --output json
# Writes: agent-doctor-report.json
```

The JSON report is machine-readable and suitable for CI dashboards, custom tooling, or downstream integrations. Run this as a **separate step** from your markdown report.

---

## How It Works

Agent-Doctor auto-detects your setup — framework, model provider, tool count, memory backend, MCP compliance — then runs two passes:

```
Your Agent Project
       |
       +-- Pass 1: Audit (80+ rules)
       |     +-- Security & Compliance
       |     +-- Configuration
       |     +-- Deployment Readiness
       |     +-- Observability
       |     +-- Reliability
       |
       +-- Pass 2: Dead Tools
             +-- Unused tool registrations
             +-- Orphaned memory configs
             +-- Unreachable agent branches
                   |
                   v
         Health Score: 0-100
         agent-doctor-report.md   (default)
         agent-doctor-report.json (--output json, separate run)
```

Rules are automatically toggled based on your framework. A LangChain project gets LangChain-specific checks. An MCP-based project gets MCP protocol compliance checks. And so on.

---

## Score

| Score   | Label        | Meaning                                |
|---------|--------------|----------------------------------------|
| 75-100  | Great        | Production-ready                       |
| 50-74   | Needs work   | Fix issues before shipping             |
| < 50    | Critical     | Major problems — do not deploy         |

Errors weigh more than warnings. A single prompt injection vulnerability can drop your score significantly.

---

## Sample Terminal Output

```
$ npx -y agent-doctor@latest .

  agent-doctor
  Let coding agents diagnose and fix your AI agent code.

> X  Prompt injection risk in tool: web_search (5)
     tools/web.py: 42, 87
     agent/main.py: 12

> X  No max_iterations limit — infinite loop risk (2)

> X  Hardcoded API key detected (3)

> X  Tool has DELETE access without confirmation step (4)

> X  No structured logging configured (8)

> X  No Dockerfile found (6)

> X  No memory TTL policy set (3)

  X X
  v

  64 / 100  Needs work
  [========            ]

  7 issues across 9 files in 1.8s

  Run agent-doctor . --fix to open suggested fixes.
```

---

## Sample Markdown Report (`agent-doctor-report.md`)

````markdown
# Agent-Doctor Report

**Agent:** support-bot  
**Framework:** LangChain 0.2  
**Model:** OpenAI GPT-4o  
**Tools:** 6  
**Memory:** Redis  
**Date:** 2025-07-14  

## Health Score: 64 / 100 — Needs work

| Category      | Score | Max |
|---------------|-------|-----|
| Security      | 14    | 25  |
| Configuration | 17    | 20  |
| Deployment    | 10    | 15  |
| Reliability   | 12    | 20  |
| Observability |  7    | 10  |
| Compliance    |  4    | 10  |

## Issues

### 🔴 Errors

- **SEC-001** `tools/web.py:42` — Prompt injection risk in tool: web_search
- **REL-002** `agent/main.py:18` — No max_iterations set, infinite loop risk

### 🟡 Warnings

- **OBS-001** `agent/main.py` — No structured logging configured
- **DEP-001** *(project root)* — No Dockerfile found
- **DEP-002** *(project root)* — No CI/CD config detected
- **CFG-001** `agent.config.yaml` — max_tokens not defined in tool config
- **CFG-002** `agent.config.yaml` — No memory TTL policy set
````

---

## Sample JSON Report (`agent-doctor-report.json`)

> Run separately: `agent-doctor . --output json`

```json
{
  "agent": "support-bot",
  "framework": "langchain",
  "modelProvider": "openai",
  "auditDate": "2025-07-14T10:22:00Z",
  "score": {
    "total": 64,
    "label": "Needs work",
    "dimensions": {
      "security":      { "score": 14, "max": 25 },
      "configuration": { "score": 17, "max": 20 },
      "deployment":    { "score": 10, "max": 15 },
      "reliability":   { "score": 12, "max": 20 },
      "observability": { "score":  7, "max": 10 },
      "compliance":    { "score":  4, "max": 10 }
    }
  },
  "issues": [
    {
      "id": "SEC-001",
      "severity": "error",
      "category": "security",
      "title": "Prompt injection risk in tool: web_search",
      "file": "tools/web.py",
      "line": 42,
      "remediation": "Sanitize all user inputs before passing to tool. Add an input guardrail layer."
    },
    {
      "id": "REL-002",
      "severity": "error",
      "category": "reliability",
      "title": "No max_iterations set — infinite loop risk",
      "file": "agent/main.py",
      "line": 18,
      "remediation": "Set max_iterations in your agent executor config. Add a loop detection guard."
    }
  ]
}
```

---

## Config

Create an `agent-doctor.config.json` in your project root to customize behavior:

```json
{
  "ignore": {
    "rules": ["DEP-001", "OBS-003"],
    "files": ["src/generated/**", "tests/**"]
  }
}
```

You can also use the `"agentDoctor"` key in your `package.json` instead:

```json
{
  "agentDoctor": {
    "ignore": {
      "rules": ["DEP-001"]
    }
  }
}
```

If both exist, `agent-doctor.config.json` takes precedence.

---

## Audit Rules

Agent-Doctor checks 80+ rules across 6 categories. Some examples:

### Security
| Rule    | Severity | Description |
|---------|----------|-------------|
| SEC-001 | error    | Prompt injection risk detected in tool input |
| SEC-002 | error    | Hardcoded secret or API key found |
| SEC-003 | error    | Tool has write/delete access without confirmation step |
| SEC-004 | warn     | No audit logging on tool calls |
| SEC-005 | warn     | Agent has excessive permissions (violates least-privilege) |

### Configuration
| Rule    | Severity | Description |
|---------|----------|-------------|
| CFG-001 | warn     | max_tokens not defined in tool config |
| CFG-002 | warn     | No memory TTL policy set |
| CFG-003 | error    | Required environment variable missing |
| CFG-004 | warn     | MCP tool schema invalid or incomplete |

### Deployment
| Rule    | Severity | Description |
|---------|----------|-------------|
| DEP-001 | warn     | No Dockerfile found |
| DEP-002 | warn     | No CI/CD configuration detected |
| DEP-003 | warn     | No rollback strategy defined |
| DEP-004 | error    | No health check endpoint configured |

### Reliability
| Rule    | Severity | Description |
|---------|----------|-------------|
| REL-001 | error    | No max_iterations limit set on agent executor |
| REL-002 | error    | Recursive tool call loop detected |
| REL-003 | warn     | No timeout configured for tool calls |
| REL-004 | warn     | No error handling on tool failures |

### Observability
| Rule    | Severity | Description |
|---------|----------|-------------|
| OBS-001 | warn     | No structured logging configured |
| OBS-002 | warn     | No distributed tracing (OpenTelemetry) |
| OBS-003 | warn     | No alerting hooks for tool failures |
| OBS-004 | error    | No error telemetry in production mode |

### Compliance
| Rule    | Severity | Description |
|---------|----------|-------------|
| CMP-001 | error    | OWASP Agentic Top 10 violation detected |
| CMP-002 | warn     | No data retention policy configured |
| CMP-003 | warn     | Agent output not validated before delivery |

---

## API

```js
import { diagnose } from "agent-doctor/api";

const result = await diagnose("./agents/support-bot");

console.log(result.score);        // { score: 64, label: "Needs work" }
console.log(result.diagnostics);  // Array of Diagnostic objects
console.log(result.project);      // Detected framework, tools, memory backend, etc.
```

The `diagnose` function accepts an optional second argument:

```js
const result = await diagnose(".", {
  audit: true,      // run audit checks (default: true)
  deadTools: true,  // run dead tool detection (default: true)
  output: "md",     // "md" (default) or "json" — not both
});
```

### Types

```ts
interface Diagnostic {
  filePath: string;
  plugin: string;
  rule: string;
  severity: "error" | "warning";
  message: string;
  help: string;
  line: number;
  column: number;
  category: "security" | "config" | "deployment" | "reliability" | "observability" | "compliance";
}

interface ProjectInfo {
  framework: string;      // "langchain" | "crewai" | "autogen" | "mcp" | "custom"
  modelProvider: string;  // "openai" | "anthropic" | "gemini" | ...
  toolCount: number;
  memoryBackend: string | null;
  mcpCompliant: boolean;
}
```

---

## CI/CD Integration

### GitHub Actions

```yaml
name: Agent Health Check

on: [push, pull_request]

jobs:
  agent-doctor:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
        with:
          fetch-depth: 0

      # Step 1 — Markdown report (human-readable, posted as PR comment)
      - name: Run Agent-Doctor (Markdown)
        run: |
          npm install -g agent-doctor
          agent-doctor . --output md

      # Step 2 — JSON report (machine-readable, separate run to avoid rate limits)
      - name: Run Agent-Doctor (JSON)
        run: agent-doctor . --output json

      - name: Upload Reports
        uses: actions/upload-artifact@v3
        with:
          name: agent-doctor-reports
          path: |
            agent-doctor-report.md
            agent-doctor-report.json
```

### GitLab CI

```yaml
agent-health-md:
  stage: test
  script:
    - npm install -g agent-doctor
    - agent-doctor . --output md
  artifacts:
    paths:
      - agent-doctor-report.md

agent-health-json:
  stage: test
  script:
    - agent-doctor . --output json
  artifacts:
    paths:
      - agent-doctor-report.json
```

---

## Supported Frameworks

| Framework   | Support  |
|-------------|----------|
| LangChain   | Full     |
| CrewAI      | Full     |
| AutoGen     | Full     |
| MCP-based   | Full     |
| LlamaIndex  | Partial  |
| Haystack    | Partial  |
| Custom      | Config   |

---

## Contributing

```bash
git clone https://github.com/your-org/agent-doctor
cd agent-doctor
pnpm install
pnpm -r run build
```

### Adding a Rule

1. Create `packages/agent-doctor/src/rules/your-rule.ts`
2. Implement the `Rule` interface
3. Register it in `src/rules/index.ts`

```ts
// src/rules/your-rule.ts
import type { Rule, RuleContext, Diagnostic } from "../types";

export const yourRule: Rule = {
  id: "SEC-010",
  category: "security",
  severity: "error",
  description: "Your rule description",

  check(context: RuleContext): Diagnostic[] {
    const issues: Diagnostic[] = [];
    // ... your logic here
    return issues;
  },
};
```

---

## License

MIT — inspired by the structure and philosophy of [react-doctor](https://github.com/millionco/react-doctor).

---

> Agent-Doctor — because agents that aren't diagnosed aren't ready.