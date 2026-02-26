import type { Rule, Diagnostic, RuleContext } from "../../types";

export const obs010: Rule = {
  id: "OBS-010",
  category: "observability",
  severity: "warn",
  title: "No SLO/SLA defined",
  check(ctx: RuleContext): Diagnostic[] {
    const sloPattern = /SLO|SLA|service.level|uptime.*%|latency.*p99|error.rate/i;
    let found = false;

    for (const [, content] of ctx.files) {
      if (sloPattern.test(content)) { found = true; break; }
    }

    if (!found) {
      return [{
        ruleId: "OBS-010",
        severity: "warn",
        category: "observability",
        title: "No SLO/SLA defined",
        remediation: "Define SLOs (latency p99, error rate, uptime) for your agent service.",
      }];
    }
    return [];
  },
};
