import type { Rule, Diagnostic, RuleContext } from "../../types";

export const rel005: Rule = {
  id: "REL-005",
  category: "reliability",
  severity: "warn",
  title: "No retry logic",
  check(ctx: RuleContext): Diagnostic[] {
    const retryPattern = /retry|tenacity|backoff|exponential.*backoff|p-retry|async-retry/i;
    let found = false;

    for (const [, content] of ctx.files) {
      if (retryPattern.test(content)) { found = true; break; }
    }

    if (!found) {
      return [{
        ruleId: "REL-005",
        severity: "warn",
        category: "reliability",
        title: "No retry logic",
        remediation: "Add retry logic with exponential backoff for transient failures.",
      }];
    }
    return [];
  },
};
