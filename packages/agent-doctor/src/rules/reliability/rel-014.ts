import type { Rule, Diagnostic, RuleContext } from "../../types";

export const rel014: Rule = {
  id: "REL-014",
  category: "reliability",
  severity: "warn",
  title: "No failure injection tests",
  check(ctx: RuleContext): Diagnostic[] {
    const chaosPattern = /chaos|fault.inject|failure.inject|chaos-monkey|toxiproxy/i;
    let found = false;

    for (const [, content] of ctx.files) {
      if (chaosPattern.test(content)) { found = true; break; }
    }

    if (!found) {
      return [{
        ruleId: "REL-014",
        severity: "warn",
        category: "reliability",
        title: "No failure injection tests",
        remediation: "Add chaos/fault injection tests to verify system behavior under failure conditions.",
      }];
    }
    return [];
  },
};
