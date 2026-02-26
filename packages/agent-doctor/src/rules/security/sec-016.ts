import type { Rule, Diagnostic, RuleContext } from "../../types";

export const sec016: Rule = {
  id: "SEC-016",
  category: "security",
  severity: "warn",
  title: "System prompt extractable",
  check(ctx: RuleContext): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const systemPromptPattern = /system_prompt|systemPrompt|system:\s*["'`]/;
    const safeguardPattern = /do not reveal|cannot share|must not repeat|confidential|keep.*secret/i;

    for (const [file, content] of ctx.files) {
      if (!systemPromptPattern.test(content)) continue;
      if (!safeguardPattern.test(content)) {
        diagnostics.push({
          ruleId: "SEC-016",
          severity: "warn",
          category: "security",
          title: "System prompt extractable",
          file,
          remediation: "Add instructions in the system prompt to not reveal its contents.",
        });
      }
    }
    return diagnostics;
  },
};
