import type { Rule, Diagnostic, RuleContext } from "../../types";

export const sec011: Rule = {
  id: "SEC-011",
  category: "security",
  severity: "warn",
  title: "Schema exposes internal details",
  check(ctx: RuleContext): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const internalPattern = /\/home\/|\/var\/|localhost|127\.0\.0\.1|internal\.|\.internal|_table|_schema/;

    for (const [file, content] of ctx.files) {
      const lines = content.split("\n");
      lines.forEach((line, i) => {
        if (internalPattern.test(line) && /description|schema|tool/i.test(line)) {
          diagnostics.push({
            ruleId: "SEC-011",
            severity: "warn",
            category: "security",
            title: "Schema exposes internal details",
            file,
            line: i + 1,
            remediation: "Remove internal paths, hostnames, or table names from tool descriptions/schemas.",
          });
        }
      });
    }
    return diagnostics;
  },
};
