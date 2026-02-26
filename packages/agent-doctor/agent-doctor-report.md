# agent-doctor Report

**Date:** 2026-02-26
**Framework:** mastra
**Model Provider:** openai
**Language:** typescript
**Tools detected:** 11
**Memory backend:** none
**Scan duration:** 0.2s

## Health Score

**13 / 100** — Critical

| Category | Score | Max |
|---|---|---|
| Security | 0 | 25 |
| Reliability | 0 | 20 |
| Config | 0 | 20 |
| Deployment | 3 | 15 |
| Observability | 10 | 10 |
| Compliance | 0 | 10 |

## Errors

### 🔴 Prompt injection risk in tool input
**Rule:** `SEC-001` | **Category:** Security
**Location:** `src/rules/security/sec-014.ts:10`
**Fix:** Sanitize or validate user-controlled input before passing to tools.

### 🔴 Prompt injection risk in tool input
**Rule:** `SEC-001` | **Category:** Security
**Location:** `src/rules/security/sec-006.ts:11`
**Fix:** Sanitize or validate user-controlled input before passing to tools.

### 🔴 Prompt injection risk in tool input
**Rule:** `SEC-001` | **Category:** Security
**Location:** `src/rules/security/sec-001.ts:10`
**Fix:** Sanitize or validate user-controlled input before passing to tools.

### 🔴 Prompt injection risk in tool input
**Rule:** `SEC-001` | **Category:** Security
**Location:** `src/rules/compliance/cmp-001.ts:10`
**Fix:** Sanitize or validate user-controlled input before passing to tools.

### 🔴 Prompt injection risk in tool input
**Rule:** `SEC-001` | **Category:** Security
**Location:** `src/rules/config/cfg-010.ts:11`
**Fix:** Sanitize or validate user-controlled input before passing to tools.

### 🔴 Destructive tool without confirmation
**Rule:** `SEC-003` | **Category:** Security
**Location:** `src/rules/security/sec-015.ts:10`
**Fix:** Add a confirmation or approval step before executing destructive operations.

### 🔴 Destructive tool without confirmation
**Rule:** `SEC-003` | **Category:** Security
**Location:** `src/rules/security/sec-011.ts:23`
**Fix:** Add a confirmation or approval step before executing destructive operations.

### 🔴 Destructive tool without confirmation
**Rule:** `SEC-003` | **Category:** Security
**Location:** `src/rules/security/sec-008.ts:24`
**Fix:** Add a confirmation or approval step before executing destructive operations.

### 🔴 Destructive tool without confirmation
**Rule:** `SEC-003` | **Category:** Security
**Location:** `src/rules/security/sec-005.ts:17`
**Fix:** Add a confirmation or approval step before executing destructive operations.

### 🔴 Destructive tool without confirmation
**Rule:** `SEC-003` | **Category:** Security
**Location:** `src/rules/security/sec-003.ts:10`
**Fix:** Add a confirmation or approval step before executing destructive operations.

### 🔴 Destructive tool without confirmation
**Rule:** `SEC-003` | **Category:** Security
**Location:** `src/rules/compliance/cmp-003.ts:9`
**Fix:** Add a confirmation or approval step before executing destructive operations.

### 🔴 Destructive tool without confirmation
**Rule:** `SEC-003` | **Category:** Security
**Location:** `src/rules/compliance/cmp-002.ts:9`
**Fix:** Add a confirmation or approval step before executing destructive operations.

### 🔴 Destructive tool without confirmation
**Rule:** `SEC-003` | **Category:** Security
**Location:** `src/rules/compliance/cmp-001.ts:13`
**Fix:** Add a confirmation or approval step before executing destructive operations.

### 🔴 Duplicate tool names
**Rule:** `CFG-008` | **Category:** Config
**Fix:** Tool name "..." is registered in multiple files: src/dead-tools/import-tracer.ts, src/dead-tools/import-tracer.ts, src/dead-tools/import-tracer.ts, src/dead-tools/import-tracer.ts. Use unique names.

### 🔴 No error handling on tools
**Rule:** `REL-004` | **Category:** Reliability
**Location:** `src/api.ts`
**Fix:** Wrap tool calls in try/catch blocks to handle failures gracefully.

### 🔴 No error handling on tools
**Rule:** `REL-004` | **Category:** Reliability
**Location:** `src/reporters/terminal.ts`
**Fix:** Wrap tool calls in try/catch blocks to handle failures gracefully.

### 🔴 OWASP Agentic Top 10 violation
**Rule:** `CMP-001` | **Category:** Compliance
**Fix:** Multiple OWASP Agentic Top 10 issues detected. Address SEC-001, SEC-003, SEC-006, SEC-007 first.

## Warnings

### 🟡 No audit logging on tool calls
**Rule:** `SEC-004` | **Category:** Security
**Location:** `src/dead-tools/import-tracer.ts`
**Fix:** Add audit logging around all tool invocations to track usage.

### 🟡 No audit logging on tool calls
**Rule:** `SEC-004` | **Category:** Security
**Location:** `src/dead-tools/call-graph.ts`
**Fix:** Add audit logging around all tool invocations to track usage.

### 🟡 Unverified third-party tool
**Rule:** `SEC-007` | **Category:** Security
**Location:** `package.json`
**Fix:** 11 dependencies use floating version ranges. Pin exact versions to prevent supply-chain attacks.

### 🟡 Schema exposes internal details
**Rule:** `SEC-011` | **Category:** Security
**Location:** `src/rules/security/sec-011.ts:10`
**Fix:** Remove internal paths, hostnames, or table names from tool descriptions/schemas.

### 🟡 No secrets rotation policy
**Rule:** `SEC-012` | **Category:** Security
**Location:** `src/rules/security/sec-002.ts`
**Fix:** Implement a secrets rotation policy with TTL or automated rotation.

### 🟡 No secrets rotation policy
**Rule:** `SEC-012` | **Category:** Security
**Location:** `src/rules/deployment/dep-009.ts`
**Fix:** Implement a secrets rotation policy with TTL or automated rotation.

### 🟡 No input length enforcement
**Rule:** `SEC-014` | **Category:** Security
**Location:** `src/cli.ts`
**Fix:** Enforce max length on agent inputs to prevent prompt flooding attacks.

### 🟡 No input length enforcement
**Rule:** `SEC-014` | **Category:** Security
**Location:** `src/rules/security/sec-016.ts`
**Fix:** Enforce max length on agent inputs to prevent prompt flooding attacks.

### 🟡 No input length enforcement
**Rule:** `SEC-014` | **Category:** Security
**Location:** `src/rules/security/sec-006.ts`
**Fix:** Enforce max length on agent inputs to prevent prompt flooding attacks.

### 🟡 No input length enforcement
**Rule:** `SEC-014` | **Category:** Security
**Location:** `src/rules/security/sec-001.ts`
**Fix:** Enforce max length on agent inputs to prevent prompt flooding attacks.

### 🟡 No input length enforcement
**Rule:** `SEC-014` | **Category:** Security
**Location:** `src/rules/observability/obs-005.ts`
**Fix:** Enforce max length on agent inputs to prevent prompt flooding attacks.

### 🟡 No input length enforcement
**Rule:** `SEC-014` | **Category:** Security
**Location:** `src/rules/compliance/cmp-006.ts`
**Fix:** Enforce max length on agent inputs to prevent prompt flooding attacks.

### 🟡 No input length enforcement
**Rule:** `SEC-014` | **Category:** Security
**Location:** `src/rules/compliance/cmp-001.ts`
**Fix:** Enforce max length on agent inputs to prevent prompt flooding attacks.

### 🟡 No input length enforcement
**Rule:** `SEC-014` | **Category:** Security
**Location:** `src/rules/config/cfg-011.ts`
**Fix:** Enforce max length on agent inputs to prevent prompt flooding attacks.

### 🟡 No input length enforcement
**Rule:** `SEC-014` | **Category:** Security
**Location:** `src/rules/config/cfg-010.ts`
**Fix:** Enforce max length on agent inputs to prevent prompt flooding attacks.

### 🟡 No input length enforcement
**Rule:** `SEC-014` | **Category:** Security
**Location:** `src/rules/config/cfg-007.ts`
**Fix:** Enforce max length on agent inputs to prevent prompt flooding attacks.

### 🟡 No input length enforcement
**Rule:** `SEC-014` | **Category:** Security
**Location:** `src/rules/config/cfg-004.ts`
**Fix:** Enforce max length on agent inputs to prevent prompt flooding attacks.

### 🟡 System prompt extractable
**Rule:** `SEC-016` | **Category:** Security
**Location:** `src/rules/compliance/cmp-006.ts`
**Fix:** Add instructions in the system prompt to not reveal its contents.

### 🟡 System prompt extractable
**Rule:** `SEC-016` | **Category:** Security
**Location:** `src/rules/config/cfg-007.ts`
**Fix:** Add instructions in the system prompt to not reveal its contents.

### 🟡 max_tokens not set
**Rule:** `CFG-001` | **Category:** Config
**Location:** `src/rules/config/cfg-010.ts`
**Fix:** Set max_tokens on LLM calls to prevent runaway token usage.

### 🟡 No memory TTL
**Rule:** `CFG-002` | **Category:** Config
**Location:** `src/types.ts`
**Fix:** Set a TTL on memory entries to prevent unbounded data accumulation.

### 🟡 No memory TTL
**Rule:** `CFG-002` | **Category:** Config
**Location:** `src/detector.ts`
**Fix:** Set a TTL on memory entries to prevent unbounded data accumulation.

### 🟡 No memory TTL
**Rule:** `CFG-002` | **Category:** Config
**Location:** `src/reporters/markdown.ts`
**Fix:** Set a TTL on memory entries to prevent unbounded data accumulation.

### 🟡 No memory TTL
**Rule:** `CFG-002` | **Category:** Config
**Location:** `src/rules/security/sec-006.ts`
**Fix:** Set a TTL on memory entries to prevent unbounded data accumulation.

### 🟡 No memory TTL
**Rule:** `CFG-002` | **Category:** Config
**Location:** `src/rules/reliability/rel-012.ts`
**Fix:** Set a TTL on memory entries to prevent unbounded data accumulation.

### 🟡 No memory TTL
**Rule:** `CFG-002` | **Category:** Config
**Location:** `src/rules/reliability/rel-007.ts`
**Fix:** Set a TTL on memory entries to prevent unbounded data accumulation.

### 🟡 No memory TTL
**Rule:** `CFG-002` | **Category:** Config
**Location:** `src/rules/observability/obs-009.ts`
**Fix:** Set a TTL on memory entries to prevent unbounded data accumulation.

### 🟡 No memory TTL
**Rule:** `CFG-002` | **Category:** Config
**Location:** `src/rules/deployment/dep-008.ts`
**Fix:** Set a TTL on memory entries to prevent unbounded data accumulation.

### 🟡 No memory TTL
**Rule:** `CFG-002` | **Category:** Config
**Location:** `src/rules/compliance/cmp-001.ts`
**Fix:** Set a TTL on memory entries to prevent unbounded data accumulation.

### 🟡 No memory TTL
**Rule:** `CFG-002` | **Category:** Config
**Location:** `src/rules/config/cfg-014.ts`
**Fix:** Set a TTL on memory entries to prevent unbounded data accumulation.

### 🟡 No input schema on tools
**Rule:** `CFG-011` | **Category:** Config
**Location:** `src/detector.ts`
**Fix:** Define input schemas for tools using Zod, Pydantic, or JSON Schema.

### 🟡 No input schema on tools
**Rule:** `CFG-011` | **Category:** Config
**Location:** `src/dead-tools/import-tracer.ts`
**Fix:** Define input schemas for tools using Zod, Pydantic, or JSON Schema.

### 🟡 No input schema on tools
**Rule:** `CFG-011` | **Category:** Config
**Location:** `src/dead-tools/call-graph.ts`
**Fix:** Define input schemas for tools using Zod, Pydantic, or JSON Schema.

### 🟡 Streaming not configured
**Rule:** `CFG-012` | **Category:** Config
**Location:** `src/rules/reliability/rel-010.ts`
**Fix:** Enable streaming for long-running tool operations to improve responsiveness.

### 🟡 No Dockerfile
**Rule:** `DEP-001` | **Category:** Deployment
**Fix:** Add a Dockerfile to containerize your agent for consistent deployments.

### 🟡 No CI/CD pipeline
**Rule:** `DEP-002` | **Category:** Deployment
**Fix:** Set up a CI/CD pipeline (GitHub Actions, GitLab CI, etc.) to automate testing and deployment.

### 🟡 No dependency lockfile
**Rule:** `DEP-006` | **Category:** Deployment
**Fix:** Commit a lockfile (package-lock.json, poetry.lock, etc.) for reproducible builds.

### 🟡 No multi-AZ / HA
**Rule:** `DEP-013` | **Category:** Deployment
**Fix:** Configure multiple replicas and multi-AZ deployment for high availability.

### 🟡 Single instance, no redundancy
**Rule:** `REL-013` | **Category:** Reliability
**Fix:** Configure at least 2 replicas for production availability.

### 🟡 No model card
**Rule:** `CMP-007` | **Category:** Compliance
**Fix:** Create a model card documenting the agent's capabilities, limitations, and intended use.

## Dead Tools

Tools that are registered but never invoked:

- `name` — registered in `src/dead-tools/import-tracer.ts:8`
- `...` — registered in `src/dead-tools/import-tracer.ts:12`
- `tool_name` — registered in `src/dead-tools/import-tracer.ts:14`
