import type { Rule, Diagnostic, RuleContext } from "../../types";

export const cfg007: Rule = {
  id: "CFG-007",
  category: "config",
  severity: "warn",
  title: "No system prompt",
  check(ctx: RuleContext): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const agentPattern = /Agent\(|createAgent|new Agent|agent\s*=\s*/i;
    const systemPromptPattern = /system_prompt|systemPrompt|system\s*:/i;

    let hasAgent = false;
    let hasSystemPrompt = false;

    for (const [, content] of ctx.files) {
      if (agentPattern.test(content)) hasAgent = true;
      if (systemPromptPattern.test(content)) hasSystemPrompt = true;
    }

    if (hasAgent && !hasSystemPrompt) {
      diagnostics.push({
        ruleId: "CFG-007",
        severity: "warn",
        category: "config",
        title: "No system prompt",
        remediation: "Define a system prompt to set agent behavior, persona, and constraints.",
      });
    }
    return diagnostics;
  },
};
