import type { Rule, Diagnostic, RuleContext } from "../../types";

export const cmp010: Rule = {
  id: "CMP-010",
  category: "compliance",
  severity: "warn",
  title: "No bias testing",
  check(ctx: RuleContext): Diagnostic[] {
    const biasPattern = /bias.test|fairness|demographic.parity|equalized.odds|disparate.impact/i;
    let found = false;

    for (const [, content] of ctx.files) {
      if (biasPattern.test(content)) { found = true; break; }
    }

    if (!found) {
      return [{
        ruleId: "CMP-010",
        severity: "warn",
        category: "compliance",
        title: "No bias testing",
        remediation: "Add bias and fairness evaluation tests for your agent's outputs.",
      }];
    }
    return [];
  },
};
