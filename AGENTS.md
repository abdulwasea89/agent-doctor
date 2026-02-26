# AGENTS.md — Instructions for AI Coding Assistants

This file tells AI agents (Claude, Copilot, Cursor, etc.) how to work in this repository.

## Project Overview

`agent-doctor` is a CLI tool that diagnoses AI agent projects. It scans source files, runs 82 audit rules across 6 categories, detects dead tools, and produces a 0–100 health score.

## Repository Structure

```
packages/agent-doctor/src/
├── types.ts          — All TypeScript interfaces (Rule, Diagnostic, RuleContext, etc.)
├── config.ts         — Reads agent-doctor.config.json or package.json#agentDoctor
├── detector.ts       — Detects framework, model provider, language; loads project files
├── engine.ts         — Orchestrates audit pass + dead-tool detection in parallel
├── scorer.ts         — Calculates weighted 0–100 score from diagnostics
├── api.ts            — Public diagnose() API (no side effects)
├── cli.ts            — Commander.js CLI entry point
├── rules/            — 82 audit rules in 6 categories
│   ├── security/     — sec-001 to sec-018
│   ├── config/       — cfg-001 to cfg-014
│   ├── deployment/   — dep-001 to dep-013
│   ├── reliability/  — rel-001 to rel-014
│   ├── observability/— obs-001 to obs-012
│   └── compliance/   — cmp-001 to cmp-011
├── dead-tools/       — Dead tool detection (import-tracer, call-graph)
└── reporters/        — terminal.ts, markdown.ts, json.ts, interactive.tsx
```

## Build & Test

```bash
cd packages/agent-doctor
npm install
npm run build        # tsc → dist/
node dist/cli.js . --verbose   # dogfood on this repo
```

## Adding a New Rule

1. Create `src/rules/<category>/<id>.ts` exporting a `Rule` object
2. Import and add it to `src/rules/index.ts` `ALL_RULES` array
3. Rules use string/regex matching on `ctx.files: Map<string, string>` — no AST parsing

Rule structure:
```ts
import type { Rule } from "../../types";

export const myRule: Rule = {
  id: "SEC-019",
  category: "security",
  severity: "error",   // "error" | "warn"
  title: "Short descriptive title",
  check(ctx) {
    const diags = [];
    for (const [file, content] of ctx.files) {
      if (/pattern/.test(content)) {
        diags.push({ ruleId: "SEC-019", severity: "error", title: "Short descriptive title", file });
      }
    }
    return diags;
  },
};
```

## Key Constraints

- **No AST parsing** — all rules use regex/string matching on raw file content
- **No breaking the public API** — `diagnose()` in `api.ts` must remain stable
- **CommonJS output** — `module: "commonjs"` in tsconfig; use dynamic `import()` for ESM deps (chalk, ink, glob)
- **Node 18+** minimum runtime
