import type { Rule, Diagnostic, RuleContext } from "../../types";

export const sec006: Rule = {
  id: "SEC-006",
  category: "security",
  severity: "error",
  title: "Untrusted data written to memory",
  check(ctx: RuleContext): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const memoryWritePattern = /memory\.write\(|\.store\(|\.add\(/g;
    const untrustedPattern = /user_input|message|request\./;

    for (const [file, content] of ctx.files) {
      const lines = content.split("\n");
      lines.forEach((line, i) => {
        if (memoryWritePattern.test(line) && untrustedPattern.test(line)) {
          memoryWritePattern.lastIndex = 0;
          diagnostics.push({
            ruleId: "SEC-006",
            severity: "error",
            category: "security",
            title: "Untrusted data written to memory",
            file,
            line: i + 1,
            remediation: "Validate and sanitize data before writing to memory stores.",
          });
        }
        memoryWritePattern.lastIndex = 0;
      });
    }
    return diagnostics;
  },
};
