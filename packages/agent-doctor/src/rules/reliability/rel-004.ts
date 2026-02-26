import type { Rule, Diagnostic, RuleContext } from "../../types";

export const rel004: Rule = {
  id: "REL-004",
  category: "reliability",
  severity: "error",
  title: "No error handling on tools",
  check(ctx: RuleContext): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const toolCallPattern = /await\s+\w+\s*\(|\.invoke\(|\.run\(/;
    const errorHandlingPattern = /try\s*\{|\.catch\(|except\s+/;

    for (const [file, content] of ctx.files) {
      if (!toolCallPattern.test(content)) continue;
      if (!errorHandlingPattern.test(content)) {
        diagnostics.push({
          ruleId: "REL-004",
          severity: "error",
          category: "reliability",
          title: "No error handling on tools",
          file,
          remediation: "Wrap tool calls in try/catch blocks to handle failures gracefully.",
        });
      }
    }
    return diagnostics;
  },
};
