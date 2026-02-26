import type { Rule, Diagnostic, RuleContext } from "../../types";

export const cfg010: Rule = {
  id: "CFG-010",
  category: "config",
  severity: "warn",
  title: "No context window management",
  check(ctx: RuleContext): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const llmPattern = /openai\.|anthropic\.|ChatOpenAI|createCompletion/;
    const contextMgmtPattern = /trim|summarize|sliding.*window|context.*limit|truncate|prune.*message/i;

    let hasLLM = false;
    let hasContextMgmt = false;

    for (const [, content] of ctx.files) {
      if (llmPattern.test(content)) hasLLM = true;
      if (contextMgmtPattern.test(content)) hasContextMgmt = true;
    }

    if (hasLLM && !hasContextMgmt) {
      diagnostics.push({
        ruleId: "CFG-010",
        severity: "warn",
        category: "config",
        title: "No context window management",
        remediation: "Implement context trimming or summarization to handle long conversations.",
      });
    }
    return diagnostics;
  },
};
