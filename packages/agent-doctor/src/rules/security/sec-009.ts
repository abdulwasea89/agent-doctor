import type { Rule, Diagnostic, RuleContext } from "../../types";

export const sec009: Rule = {
  id: "SEC-009",
  category: "security",
  severity: "warn",
  title: "Tool results not validated",
  check(ctx: RuleContext): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const toolResultPattern = /tool_result|toolResult|tool\.run|invoke\(/;
    const validationPattern = /parse|validate|schema|zod|pydantic|\.safeParse/;

    for (const [file, content] of ctx.files) {
      if (!toolResultPattern.test(content)) continue;
      if (!validationPattern.test(content)) {
        diagnostics.push({
          ruleId: "SEC-009",
          severity: "warn",
          category: "security",
          title: "Tool results not validated",
          file,
          remediation: "Validate tool output against a schema before using in subsequent steps.",
        });
      }
    }
    return diagnostics;
  },
};
