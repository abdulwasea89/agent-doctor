import type { Rule, Diagnostic, RuleContext } from "../../types";

export const cmp011: Rule = {
  id: "CMP-011",
  category: "compliance",
  severity: "warn",
  title: "No AI incident response plan",
  check(ctx: RuleContext): Diagnostic[] {
    const incidentPattern = /incident.response|runbook|playbook|postmortem|on.call/i;
    let found = false;

    for (const [file, content] of ctx.files) {
      if (incidentPattern.test(content) || incidentPattern.test(file)) {
        found = true;
        break;
      }
    }

    if (!found) {
      return [{
        ruleId: "CMP-011",
        severity: "warn",
        category: "compliance",
        title: "No AI incident response plan",
        remediation: "Create an incident response playbook for AI failures and hallucinations.",
      }];
    }
    return [];
  },
};
