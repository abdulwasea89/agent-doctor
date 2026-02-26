import type { Rule, Diagnostic, RuleContext } from "../../types";

export const obs009: Rule = {
  id: "OBS-009",
  category: "observability",
  severity: "warn",
  title: "Memory ops not traced",
  check(ctx: RuleContext): Diagnostic[] {
    if (ctx.projectInfo.memoryBackend === "none") return [];

    const memoryOpPattern = /memory\.read|memory\.write|\.get\(|\.set\(|\.store\(/;
    const loggingPattern = /logger\.|log\.|trace\.|span\./;

    for (const [file, content] of ctx.files) {
      if (!memoryOpPattern.test(content)) continue;
      if (!loggingPattern.test(content)) {
        return [{
          ruleId: "OBS-009",
          severity: "warn",
          category: "observability",
          title: "Memory ops not traced",
          file,
          remediation: "Add logging/tracing around memory read/write operations.",
        }];
      }
    }
    return [];
  },
};
