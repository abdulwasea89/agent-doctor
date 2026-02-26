import type { Rule, Diagnostic, RuleContext } from "../../types";

export const sec002: Rule = {
  id: "SEC-002",
  category: "security",
  severity: "error",
  title: "Hardcoded secret or API key",
  check(ctx: RuleContext): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const secretPattern = /sk-[a-zA-Z0-9]{20,}|api_key\s*=\s*["'][a-z0-9]{8,}|token\s*=\s*["'][A-Za-z0-9]{8,}/g;
    const envFilePattern = /\.env/;

    for (const [file, content] of ctx.files) {
      if (envFilePattern.test(file)) continue;
      const lines = content.split("\n");
      lines.forEach((line, i) => {
        if (secretPattern.test(line)) {
          secretPattern.lastIndex = 0;
          diagnostics.push({
            ruleId: "SEC-002",
            severity: "error",
            category: "security",
            title: "Hardcoded secret or API key",
            file,
            line: i + 1,
            remediation: "Move secrets to environment variables or a secrets manager.",
          });
        }
        secretPattern.lastIndex = 0;
      });
    }
    return diagnostics;
  },
};
