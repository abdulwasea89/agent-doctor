import type { Rule, Diagnostic, RuleContext } from "../../types";

export const dep010: Rule = {
  id: "DEP-010",
  category: "deployment",
  severity: "warn",
  title: "No staging environment",
  check(ctx: RuleContext): Diagnostic[] {
    const stagingPattern = /staging|stage|pre-prod|preprod/i;
    let found = false;

    for (const [, content] of ctx.files) {
      if (stagingPattern.test(content)) { found = true; break; }
    }

    if (!found) {
      return [{
        ruleId: "DEP-010",
        severity: "warn",
        category: "deployment",
        title: "No staging environment",
        remediation: "Set up a staging environment to test changes before production deployment.",
      }];
    }
    return [];
  },
};
