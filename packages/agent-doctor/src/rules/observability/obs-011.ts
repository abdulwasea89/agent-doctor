import type { Rule, Diagnostic, RuleContext } from "../../types";

export const obs011: Rule = {
  id: "OBS-011",
  category: "observability",
  severity: "warn",
  title: "No LLM cost budget",
  check(ctx: RuleContext): Diagnostic[] {
    const budgetPattern = /cost.*budget|budget.*cost|spending.*limit|cost.*limit|max.*spend/i;
    let found = false;

    for (const [, content] of ctx.files) {
      if (budgetPattern.test(content)) { found = true; break; }
    }

    if (!found) {
      return [{
        ruleId: "OBS-011",
        severity: "warn",
        category: "observability",
        title: "No LLM cost budget",
        remediation: "Set cost thresholds or budget alerts to prevent unexpected LLM spending.",
      }];
    }
    return [];
  },
};
