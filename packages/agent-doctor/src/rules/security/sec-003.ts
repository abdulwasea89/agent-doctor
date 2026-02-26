import type { Rule, Diagnostic, RuleContext } from "../../types";

export const sec003: Rule = {
  id: "SEC-003",
  category: "security",
  severity: "error",
  title: "Destructive tool without confirmation",
  check(ctx: RuleContext): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const destructivePattern = /\b(delete|remove|send|publish)\b/i;
    const safePattern = /\b(confirm|approval|approve)\b/i;

    for (const [file, content] of ctx.files) {
      const lines = content.split("\n");
      lines.forEach((line, i) => {
        if (destructivePattern.test(line) && !safePattern.test(line)) {
          diagnostics.push({
            ruleId: "SEC-003",
            severity: "error",
            category: "security",
            title: "Destructive tool without confirmation",
            file,
            line: i + 1,
            remediation: "Add a confirmation or approval step before executing destructive operations.",
          });
        }
      });
    }
    return diagnostics;
  },
};
