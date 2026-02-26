import type { Rule, Diagnostic, RuleContext } from "../../types";

export const sec004: Rule = {
  id: "SEC-004",
  category: "security",
  severity: "warn",
  title: "No audit logging on tool calls",
  check(ctx: RuleContext): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const toolCallPattern = /\.tool\(|invoke_tool|run_tool|call_tool/;
    const loggingPattern = /logger\.|log\.|audit|logging/;

    for (const [file, content] of ctx.files) {
      if (!toolCallPattern.test(content)) continue;
      if (!loggingPattern.test(content)) {
        diagnostics.push({
          ruleId: "SEC-004",
          severity: "warn",
          category: "security",
          title: "No audit logging on tool calls",
          file,
          remediation: "Add audit logging around all tool invocations to track usage.",
        });
      }
    }
    return diagnostics;
  },
};
