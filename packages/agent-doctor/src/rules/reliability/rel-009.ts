import type { Rule, Diagnostic, RuleContext } from "../../types";

export const rel009: Rule = {
  id: "REL-009",
  category: "reliability",
  severity: "warn",
  title: "No circuit breaker",
  check(ctx: RuleContext): Diagnostic[] {
    const circuitPattern = /circuit.*breaker|CircuitBreaker|pybreaker|opossum|resilience4j|braker/i;
    let found = false;

    for (const [, content] of ctx.files) {
      if (circuitPattern.test(content)) { found = true; break; }
    }

    if (!found) {
      return [{
        ruleId: "REL-009",
        severity: "warn",
        category: "reliability",
        title: "No circuit breaker",
        remediation: "Implement circuit breakers to prevent cascade failures from downstream service outages.",
      }];
    }
    return [];
  },
};
