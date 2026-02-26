import type { Rule, Diagnostic, RuleContext } from "../../types";

export const obs012: Rule = {
  id: "OBS-012",
  category: "observability",
  severity: "warn",
  title: "No user feedback signal",
  check(ctx: RuleContext): Diagnostic[] {
    const feedbackPattern = /thumbs|rating|feedback|upvote|downvote|helpful|satisfaction/i;
    let found = false;

    for (const [, content] of ctx.files) {
      if (feedbackPattern.test(content)) { found = true; break; }
    }

    if (!found) {
      return [{
        ruleId: "OBS-012",
        severity: "warn",
        category: "observability",
        title: "No user feedback signal",
        remediation: "Collect user feedback (thumbs up/down, ratings) to evaluate agent quality.",
      }];
    }
    return [];
  },
};
