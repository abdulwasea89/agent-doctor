import type { Rule, Diagnostic, RuleContext } from "../../types";

export const cfg006: Rule = {
  id: "CFG-006",
  category: "config",
  severity: "warn",
  title: "No fallback model",
  check(ctx: RuleContext): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const fallbackPattern = /fallback|fallbackModel|backup.*model|model.*fallback|router|ModelRouter/i;
    const modelPattern = /gpt-4|gpt-3|claude-|gemini-|llama-/i;

    let hasModel = false;
    let hasFallback = false;

    for (const [, content] of ctx.files) {
      if (modelPattern.test(content)) hasModel = true;
      if (fallbackPattern.test(content)) hasFallback = true;
    }

    if (hasModel && !hasFallback) {
      diagnostics.push({
        ruleId: "CFG-006",
        severity: "warn",
        category: "config",
        title: "No fallback model",
        remediation: "Configure a fallback model or router for resilience when primary model is unavailable.",
      });
    }
    return diagnostics;
  },
};
