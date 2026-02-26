import type { Rule, Diagnostic, RuleContext } from "../../types";

export const sec010: Rule = {
  id: "SEC-010",
  category: "security",
  severity: "warn",
  title: "No rate limiting",
  check(ctx: RuleContext): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const httpPattern = /fetch\(|axios\.|requests\.|httpx\.|got\(/;
    const rateLimitPattern = /rateLimit|throttle|limiter|rate_limit/;

    for (const [file, content] of ctx.files) {
      if (!httpPattern.test(content)) continue;
      if (!rateLimitPattern.test(content)) {
        diagnostics.push({
          ruleId: "SEC-010",
          severity: "warn",
          category: "security",
          title: "No rate limiting",
          file,
          remediation: "Add rate limiting to HTTP clients to prevent abuse and API exhaustion.",
        });
      }
    }
    return diagnostics;
  },
};
