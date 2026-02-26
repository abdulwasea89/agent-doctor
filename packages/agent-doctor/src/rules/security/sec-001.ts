import type { Rule, Diagnostic, RuleContext } from "../../types";

export const sec001: Rule = {
  id: "SEC-001",
  category: "security",
  severity: "error",
  title: "Prompt injection risk in tool input",
  check(ctx: RuleContext): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const unsafePatterns = /user_input|message|request\./g;
    const safePatterns = /sanitize|guardrail|validate/;

    for (const [file, content] of ctx.files) {
      const lines = content.split("\n");
      lines.forEach((line, i) => {
        if (unsafePatterns.test(line) && !safePatterns.test(line)) {
          unsafePatterns.lastIndex = 0;
          diagnostics.push({
            ruleId: "SEC-001",
            severity: "error",
            category: "security",
            title: "Prompt injection risk in tool input",
            file,
            line: i + 1,
            remediation: "Sanitize or validate user-controlled input before passing to tools.",
          });
        }
        unsafePatterns.lastIndex = 0;
      });
    }
    return diagnostics;
  },
};
