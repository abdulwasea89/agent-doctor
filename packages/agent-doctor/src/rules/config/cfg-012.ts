import type { Rule, Diagnostic, RuleContext } from "../../types";

export const cfg012: Rule = {
  id: "CFG-012",
  category: "config",
  severity: "warn",
  title: "Streaming not configured",
  check(ctx: RuleContext): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const longOpPattern = /sleep|time\.sleep|await.*delay|long.*running|batch.*process/i;
    const streamPattern = /stream\s*:\s*true|streaming\s*=\s*True|streamText|streamObject/i;

    for (const [file, content] of ctx.files) {
      if (!longOpPattern.test(content)) continue;
      if (!streamPattern.test(content)) {
        diagnostics.push({
          ruleId: "CFG-012",
          severity: "warn",
          category: "config",
          title: "Streaming not configured",
          file,
          remediation: "Enable streaming for long-running tool operations to improve responsiveness.",
        });
      }
    }
    return diagnostics;
  },
};
