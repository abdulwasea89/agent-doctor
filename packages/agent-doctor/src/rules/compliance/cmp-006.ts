import type { Rule, Diagnostic, RuleContext } from "../../types";

export const cmp006: Rule = {
  id: "CMP-006",
  category: "compliance",
  severity: "warn",
  title: "No AI disclosure",
  check(ctx: RuleContext): Diagnostic[] {
    const systemPromptPattern = /system_prompt|systemPrompt|system\s*:/i;
    const disclosurePattern = /I am an AI|This is an AI|powered by AI|AI assistant|bot disclosure|automated/i;

    let hasSystemPrompt = false;
    let hasDisclosure = false;

    for (const [, content] of ctx.files) {
      if (systemPromptPattern.test(content)) hasSystemPrompt = true;
      if (disclosurePattern.test(content)) hasDisclosure = true;
    }

    if (hasSystemPrompt && !hasDisclosure) {
      return [{
        ruleId: "CMP-006",
        severity: "warn",
        category: "compliance",
        title: "No AI disclosure",
        remediation: "Include AI/bot disclosure in the system prompt or user-facing interface.",
      }];
    }
    return [];
  },
};
