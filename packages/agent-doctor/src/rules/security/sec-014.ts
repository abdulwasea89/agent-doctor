import type { Rule, Diagnostic, RuleContext } from "../../types";

export const sec014: Rule = {
  id: "SEC-014",
  category: "security",
  severity: "warn",
  title: "No input length enforcement",
  check(ctx: RuleContext): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const inputPattern = /user_input|message|prompt|input/i;
    const lengthPattern = /max_length|maxLength|maxTokens|max_tokens|\.length\s*[<>]/;

    for (const [file, content] of ctx.files) {
      if (!inputPattern.test(content)) continue;
      if (!lengthPattern.test(content)) {
        diagnostics.push({
          ruleId: "SEC-014",
          severity: "warn",
          category: "security",
          title: "No input length enforcement",
          file,
          remediation: "Enforce max length on agent inputs to prevent prompt flooding attacks.",
        });
      }
    }
    return diagnostics;
  },
};
