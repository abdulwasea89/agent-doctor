import type { Rule, Diagnostic, RuleContext } from "../../types";

export const obs005: Rule = {
  id: "OBS-005",
  category: "observability",
  severity: "warn",
  title: "No LLM cost tracking",
  protectionKey: "cost-tracking",
  check(ctx: RuleContext): Diagnostic[] {
    const costPattern = /usage\.total_tokens|promptTokens|completionTokens|cost.*track|token.*usage|usage\.tokens/i;
    let found = false;

    for (const [, content] of ctx.files) {
      if (costPattern.test(content)) { found = true; break; }
    }

    if (!found) {
      return [{
        ruleId: "OBS-005",
        severity: "warn",
        category: "observability",
        title: "No LLM cost tracking",
        remediation: "Log token usage from LLM responses to track and optimize costs.",
      }];
    }
    return [];
  },
};
