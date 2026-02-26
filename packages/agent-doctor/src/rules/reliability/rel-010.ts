import type { Rule, Diagnostic, RuleContext } from "../../types";

export const rel010: Rule = {
  id: "REL-010",
  category: "reliability",
  severity: "warn",
  title: "Long tasks run synchronously",
  check(ctx: RuleContext): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const syncLongOpPattern = /time\.sleep\(\d{2,}|sleep\(\d{2,}|\.wait\(\d{5,}/;
    const asyncPattern = /async\s+def|async\s+function|await\s+|celery|rq\.|queue\./;

    for (const [file, content] of ctx.files) {
      if (!syncLongOpPattern.test(content)) continue;
      if (!asyncPattern.test(content)) {
        diagnostics.push({
          ruleId: "REL-010",
          severity: "warn",
          category: "reliability",
          title: "Long tasks run synchronously",
          file,
          remediation: "Move long-running operations to async queues (Celery, BullMQ, etc.).",
        });
      }
    }
    return diagnostics;
  },
};
