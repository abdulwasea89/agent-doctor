import type { Rule, Diagnostic, RuleContext } from "../../types";

export const obs003: Rule = {
  id: "OBS-003",
  category: "observability",
  severity: "warn",
  title: "No alerting on tool failures",
  protectionKey: "tool-alerting",
  check(ctx: RuleContext): Diagnostic[] {
    const alertPattern = /pagerduty|opsgenie|alertmanager|alert\.|notify\.|slack.*error|error.*slack/i;
    let found = false;

    for (const [, content] of ctx.files) {
      if (alertPattern.test(content)) { found = true; break; }
    }

    if (!found) {
      return [{
        ruleId: "OBS-003",
        severity: "warn",
        category: "observability",
        title: "No alerting on tool failures",
        remediation: "Configure alerts (PagerDuty, Opsgenie, Slack) for tool failure rates.",
      }];
    }
    return [];
  },
};
