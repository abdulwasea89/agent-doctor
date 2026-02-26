# Agent-Doctor — Implementation Plan

## Project Overview

Agent-Doctor is a CLI diagnostic tool that diagnoses and hardens AI agent projects before they hit production. It auto-detects frameworks (LangChain, CrewAI, AutoGen, MCP, etc.), runs 80+ audit rules, detects dead tools, produces a 0–100 health score, and generates Markdown or JSON reports.

**Current state:** Documentation complete, zero implementation code. All design decisions are captured in `README.md`, `FEATURES.md`, and `RULES.md`.

---

## Architecture

```
packages/agent-doctor/
└── src/
    ├── types.ts              # Core interfaces
    ├── detector.ts           # Framework auto-detection
    ├── config.ts             # Config file reader
    ├── engine.ts             # Two-pass analysis engine
    ├── scorer.ts             # Weighted health score (0–100)
    ├── rules/
    │   ├── index.ts          # Rule registry
    │   ├── security/         # SEC-001 – SEC-018 (18 rules)
    │   ├── config/           # CFG-001 – CFG-014 (14 rules)
    │   ├── deployment/       # DEP-001 – DEP-013 (13 rules)
    │   ├── reliability/      # REL-001 – REL-014 (14 rules)
    │   ├── observability/    # OBS-001 – OBS-012 (12 rules)
    │   └── compliance/       # CMP-001 – CMP-011 (11 rules)
    ├── dead-tools/
    │   ├── call-graph.ts     # Call graph builder
    │   ├── import-tracer.ts  # Import tracer
    │   └── index.ts          # Dead registration detector
    ├── reporters/
    │   ├── terminal.ts       # Styled terminal output + progress bar
    │   ├── markdown.ts       # agent-doctor-report.md
    │   └── json.ts           # agent-doctor-report.json
    ├── api.ts                # diagnose() programmatic API
    └── cli.ts                # CLI entry point (Commander.js)
```

---

## Phase 1 — Foundation

**Goal:** Establish the buildable skeleton with types, config, and CLI wiring.

### Tasks

- [ ] **1.1 Setup package.json**
  - Add `bin`, `main`, `exports`, `scripts` (build, dev, test) to `packages/agent-doctor/package.json`
  - Add dependencies: `commander`, `chalk`, `glob`, `@typescript-eslint/parser` (for AST)
  - Add `pnpm-workspace.yaml` or workspace field to root `package.json`

- [ ] **1.2 Create `src/types.ts`**
  - `Rule` interface: `{ id, category, severity, title, check(ctx): Diagnostic[] }`
  - `RuleContext`: project path, parsed files, framework info, config
  - `Diagnostic`: `{ ruleId, severity, message, file?, line?, fix? }`
  - `ProjectInfo`: detected framework, language, version, tools list
  - `DiagnoseResult`: `{ score, grade, dimensions, diagnostics, deadTools, projectInfo }`
  - `Severity`: `"error" | "warning" | "info"`
  - `Category`: `"security" | "config" | "deployment" | "reliability" | "observability" | "compliance"`

- [ ] **1.3 Create `src/config.ts`**
  - Read `agent-doctor.config.json` at project root
  - Fallback to `agentDoctor` key in `package.json`
  - Support: `ignoreRules`, `ignoreFiles`, `threshold`, `outputFormat`
  - Return typed `AgentDoctorConfig` object

- [ ] **1.4 Create `src/cli.ts`** (wiring only, no logic yet)
  - Set up Commander.js with all flags:
    - `--no-audit` — skip audit pass
    - `--no-dead-tools` — skip dead tool detection
    - `--verbose` — show all rules, not just failures
    - `--score` — print only the numeric score (for CI)
    - `-y / --yes` — skip confirmation prompts
    - `--project <path>` — target directory (default: cwd)
    - `--diff [base]` — compare score against git base branch
    - `--fix` — apply auto-fixes (requires JSON output disabled)
    - `--output <format>` — `markdown`, `json`, or `terminal`
  - Wire to a `main()` stub that prints "Not implemented yet"
  - Add `bin` field: `"agent-doctor": "dist/cli.js"`

---

## Phase 2 — Framework Detection

**Goal:** Auto-detect which AI framework the target project uses.

### Tasks

- [ ] **2.1 Create `src/detector.ts`**
  - Read target project's `package.json` for JS/TS frameworks:
    - `langchain`, `@langchain/core` → LangChain
    - `crewai` → CrewAI (also check `requirements.txt`)
    - `autogen`, `pyautogen` → AutoGen
    - `@modelcontextprotocol/sdk`, `mcp` → MCP
    - `openai-agents` → OpenAI Agents SDK
    - `mastra` → Mastra
    - `llamaindex` → LlamaIndex
  - Read `requirements.txt` / `pyproject.toml` for Python frameworks
  - Detect language: TypeScript, JavaScript, Python
  - Detect registered tools: scan for `.tool()`, `@tool`, `DynamicTool`, `StructuredTool`, `Tool()` patterns
  - Return `ProjectInfo`

---

## Phase 3 — Rule Engine

**Goal:** Build the engine and implement all 82 audit rules.

### Tasks

- [ ] **3.1 Create `src/engine.ts`**
  - Accept `ProjectInfo` + `AgentDoctorConfig` + rule list
  - Run two passes **in parallel** (using `Promise.all`):
    - **Audit pass**: run all enabled rules against the codebase
    - **Dead tools pass**: run dead tool detection
  - Collect all `Diagnostic[]` results
  - Pass results to scorer

- [ ] **3.2 Create `src/rules/index.ts`**
  - Export `ALL_RULES: Rule[]` — the complete registry
  - Support filtering by category and `ignoreRules` config

- [ ] **3.3 Implement Security Rules** (`src/rules/security/`)
  - SEC-001: Hardcoded API keys / secrets in source
  - SEC-002: API keys in environment without validation
  - SEC-003: Missing input sanitization on tool inputs
  - SEC-004: Prompt injection vectors (f-strings with user input)
  - SEC-005: Overly permissive tool permissions
  - SEC-006: Missing output validation
  - SEC-007: Insecure deserialization
  - SEC-008: SSRF risk in HTTP tools
  - SEC-009: Path traversal in file tools
  - SEC-010: Missing rate limiting
  - SEC-011: Sensitive data in logs
  - SEC-012: Missing authentication on agent endpoints
  - SEC-013: Insecure random for token generation
  - SEC-014: Eval/exec with agent output
  - SEC-015: Missing CORS configuration
  - SEC-016: SQL injection in tool queries
  - SEC-017: Command injection in shell tools
  - SEC-018: Missing secret rotation policy

- [ ] **3.4 Implement Config Rules** (`src/rules/config/`)
  - CFG-001 through CFG-014 (model config, timeout, retry, temperature, fallback, etc.)

- [ ] **3.5 Implement Deployment Rules** (`src/rules/deployment/`)
  - DEP-001 through DEP-013 (health checks, graceful shutdown, resource limits, etc.)

- [ ] **3.6 Implement Reliability Rules** (`src/rules/reliability/`)
  - REL-001 through REL-014 (retry logic, circuit breaker, error handling, etc.)

- [ ] **3.7 Implement Observability Rules** (`src/rules/observability/`)
  - OBS-001 through OBS-012 (tracing, structured logging, metrics, etc.)

- [ ] **3.8 Implement Compliance Rules** (`src/rules/compliance/`)
  - CMP-001 through CMP-011 (PII handling, data retention, audit logs, etc.)

---

## Phase 4 — Dead Tool Detection

**Goal:** Find tools that are registered but never called.

### Tasks

- [ ] **4.1 Create `src/dead-tools/import-tracer.ts`**
  - Walk the project AST to find all tool registrations
  - Track: variable name, file, line number

- [ ] **4.2 Create `src/dead-tools/call-graph.ts`**
  - Build a call graph from all source files
  - Find which registered tools are never invoked

- [ ] **4.3 Create `src/dead-tools/index.ts`**
  - Export `detectDeadTools(ctx: RuleContext): DeadTool[]`
  - Each `DeadTool`: `{ name, registeredIn, registeredAt }`

---

## Phase 5 — Scorer

**Goal:** Produce the 0–100 health score with six weighted dimensions.

### Tasks

- [ ] **5.1 Create `src/scorer.ts`**
  - Accept all `Diagnostic[]` and `DeadTool[]`
  - Calculate per-dimension scores (errors deduct more than warnings):
    - Security: **25%**
    - Reliability: **20%**
    - Configuration: **20%**
    - Deployment: **15%**
    - Observability: **10%**
    - Compliance: **10%**
  - Combine into final 0–100 score
  - Map score to grade: A (90–100), B (75–89), C (60–74), D (45–59), F (<45)
  - Return `{ score, grade, dimensions }` per `DiagnoseResult`

---

## Phase 6 — Reporters

**Goal:** Output results in terminal, Markdown, and JSON formats.

### Tasks

- [ ] **6.1 Create `src/reporters/terminal.ts`**
  - Styled header with project name and detected framework
  - Animated progress bar during analysis
  - Per-rule output with colored severity badges
  - Final score display with ASCII grade card
  - CI-friendly `--score` mode (prints only the number)

- [ ] **6.2 Create `src/reporters/markdown.ts`**
  - Write `agent-doctor-report.md` to project root
  - Sections: Summary, Score Breakdown, Diagnostics by Category, Dead Tools, Recommendations
  - Each diagnostic: rule ID, severity, file:line, message, fix hint

- [ ] **6.3 Create `src/reporters/json.ts`**
  - Write `agent-doctor-report.json` to project root
  - Matches the `DiagnoseResult` interface exactly
  - Pretty-printed with 2-space indentation

---

## Phase 7 — Auto-Fix

**Goal:** Apply safe, mechanical fixes for rules that support it.

### Tasks

- [ ] **7.1 Add `fix` handlers to applicable rules**
  - Each fixable rule's `Diagnostic` includes a `fix` property: `{ description, apply(src): string }`
  - Candidate rules: SEC-002 (move key to .env), CFG-001 (add missing config key), etc.

- [ ] **7.2 Implement fix runner in `src/engine.ts`**
  - Only run when `--fix` flag is set
  - Prompt user for confirmation unless `--yes` is set
  - Apply fixes in-place, write modified files
  - Print a summary of applied fixes

---

## Phase 8 — Programmatic API

**Goal:** Allow `import { diagnose } from "agent-doctor/api"` usage.

### Tasks

- [ ] **8.1 Create `src/api.ts`**
  - Export `diagnose(options: DiagnoseOptions): Promise<DiagnoseResult>`
  - Options: `{ projectPath, rules?, config?, skipDeadTools?, skipAudit? }`
  - No side effects (no file writes, no terminal output)
  - Add `exports` field in `package.json` for `"agent-doctor/api"` subpath

---

## Phase 9 — Diff Mode

**Goal:** Compare scores between the current branch and a base branch.

### Tasks

- [ ] **9.1 Implement `--diff [base]` in `src/cli.ts`**
  - Default base: `main`
  - Run `git stash`, diagnose base branch, `git stash pop`, diagnose current
  - Show score delta: `+5` (green) or `-3` (red)
  - Show new/resolved diagnostics in the diff

---

## Phase 10 — Infrastructure

**Goal:** Production-ready packaging, Docker, and CI integration.

### Tasks

- [ ] **10.1 Write `Dockerfile`**
  - Multi-stage build: builder (node:20-alpine) + runtime
  - `ENTRYPOINT ["agent-doctor"]`
  - Expose no ports (CLI tool only)

- [ ] **10.2 Fill `docker.yaml`** (currently empty)
  - Docker Compose file for development and testing

- [ ] **10.3 Add GitHub Actions workflow**
  - `.github/workflows/ci.yml`: build, lint, test on push/PR
  - `.github/workflows/publish.yml`: publish to npm on tag

- [ ] **10.4 Write test suite**
  - Unit tests for each rule (pass/fail cases)
  - Integration tests with fixture projects (one per framework)
  - Scorer tests with known inputs/outputs
  - CLI tests (smoke test with `--score`)

- [ ] **10.5 Fill empty stub files**
  - `LICENSE`: MIT license text
  - `CONTRIBUTION.md`: contributing guide
  - `AGENTS.md`: agent instructions for AI contributors
  - `packages/agent-doctor/CHANGELOG.md`: initial entry

---

## Score Weighting Reference

| Dimension     | Weight | Rules         |
|---------------|--------|---------------|
| Security      | 25%    | SEC-001–018   |
| Reliability   | 20%    | REL-001–014   |
| Configuration | 20%    | CFG-001–014   |
| Deployment    | 15%    | DEP-001–013   |
| Observability | 10%    | OBS-001–012   |
| Compliance    | 10%    | CMP-001–011   |

## Grade Scale

| Score  | Grade | Meaning                    |
|--------|-------|----------------------------|
| 90–100 | A     | Production ready           |
| 75–89  | B     | Minor issues to address    |
| 60–74  | C     | Significant gaps           |
| 45–59  | D     | Not production ready       |
| < 45   | F     | Critical issues present    |

---

## Implementation Order (Recommended)

```
Phase 1 → Phase 2 → Phase 3 (partial: SEC rules first) →
Phase 5 → Phase 6 (terminal only) → Phase 3 (remaining rules) →
Phase 4 → Phase 6 (markdown + json) → Phase 7 → Phase 8 →
Phase 9 → Phase 10
```

Start with Phase 1–3 (foundation + framework detection + security rules) to get a working CLI that produces real output as fast as possible, then fill in the remaining rule categories and features.
