import type { Rule, Diagnostic, RuleContext } from "../../types";

export const cfg001: Rule = {
  id: "CFG-001",
  category: "config",
  severity: "warn",
  title: "max_tokens not set",
  check(ctx: RuleContext): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const llmCallPattern = /openai\.|anthropic\.|ChatOpenAI|ChatAnthropic|createCompletion|chat\.completions/;
    const maxTokensPattern = /max_tokens|maxTokens/;

    for (const [file, content] of ctx.files) {
      if (!llmCallPattern.test(content)) continue;
      if (!maxTokensPattern.test(content)) {
        diagnostics.push({
          ruleId: "CFG-001",
          severity: "warn",
          category: "config",
          title: "max_tokens not set",
          file,
          remediation: "Set max_tokens on LLM calls to prevent runaway token usage.",
        });
      }
    }
    return diagnostics;
  },
};
