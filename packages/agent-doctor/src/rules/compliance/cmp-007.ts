import type { Rule, Diagnostic, RuleContext } from "../../types";

export const cmp007: Rule = {
  id: "CMP-007",
  category: "compliance",
  severity: "warn",
  title: "No model card",
  check(ctx: RuleContext): Diagnostic[] {
    const hasModelCardFile = Array.from(ctx.files.keys()).some(f =>
      f.toLowerCase().includes("model-card") ||
      f.toLowerCase().includes("model_card") ||
      f.toLowerCase().includes("modelcard")
    );
    
    if (hasModelCardFile) {
      return [];
    }

    const modelCardPattern = /model.card|model\s+information|capabilities|limitations/i;
    for (const file of ctx.files.keys()) {
      if (/README/i.test(file)) {
        const content = ctx.files.get(file) || "";
        if (modelCardPattern.test(content)) {
          return [];
        }
      }
    }

    return [{
      ruleId: "CMP-007",
      severity: "warn",
      category: "compliance",
      title: "No model card",
      remediation: "Create a model card documenting the agent's capabilities, limitations, and intended use.",
    }];
  },
};
