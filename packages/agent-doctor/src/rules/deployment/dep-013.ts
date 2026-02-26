import type { Rule, Diagnostic, RuleContext } from "../../types";

export const dep013: Rule = {
  id: "DEP-013",
  category: "deployment",
  severity: "warn",
  title: "No multi-AZ / HA",
  check(ctx: RuleContext): Diagnostic[] {
    const haPattern = /replicas\s*:\s*[2-9]|multi.az|availability.zone|HighAvailability|replication/i;
    let found = false;

    for (const [file, content] of ctx.files) {
      if (!file.endsWith(".yaml") && !file.endsWith(".yml")) continue;
      if (haPattern.test(content)) { found = true; break; }
    }

    if (!found) {
      return [{
        ruleId: "DEP-013",
        severity: "warn",
        category: "deployment",
        title: "No multi-AZ / HA",
        remediation: "Configure multiple replicas and multi-AZ deployment for high availability.",
      }];
    }
    return [];
  },
};
