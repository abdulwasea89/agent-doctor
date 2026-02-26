import type { Rule, Diagnostic, RuleContext } from "../../types";

export const sec008: Rule = {
  id: "SEC-008",
  category: "security",
  severity: "error",
  title: "PII logged in tool output",
  check(ctx: RuleContext): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const logPattern = /logger\.|console\.log|print\(/;
    const piiPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|\b\d{3}[-.]?\d{3}[-.]?\d{4}\b|\b\d{3}-\d{2}-\d{4}\b/;

    for (const [file, content] of ctx.files) {
      const lines = content.split("\n");
      lines.forEach((line, i) => {
        if (logPattern.test(line) && piiPattern.test(line)) {
          diagnostics.push({
            ruleId: "SEC-008",
            severity: "error",
            category: "security",
            title: "PII logged in tool output",
            file,
            line: i + 1,
            remediation: "Remove or redact PII (email, phone, SSN) from log statements.",
          });
        }
      });
    }
    return diagnostics;
  },
};
