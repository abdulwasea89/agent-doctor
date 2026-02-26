import type { Rule, Diagnostic, RuleContext } from "../../types";

export const cmp007: Rule = {
  id: "CMP-007",
  category: "compliance",
  severity: "warn",
  title: "No model card",
  check(ctx: RuleContext): Diagnostic[] {
    const modelCardPattern = /model.card|MODEL.CARD|model-card/i;
    let found = false;

    for (const file of ctx.files.keys()) {
      if (/model.card|MODEL_CARD/i.test(file) || /README/i.test(file)) {
        const content = ctx.files.get(file) || "";
        if (modelCardPattern.test(content) || modelCardPattern.test(file)) {
          found = true;
          break;
        }
      }
    }

    if (!found) {
      return [{
        ruleId: "CMP-007",
        severity: "warn",
        category: "compliance",
        title: "No model card",
        remediation: "Create a model card documenting the agent's capabilities, limitations, and intended use.",
      }];
    }
    return [];
  },
};
