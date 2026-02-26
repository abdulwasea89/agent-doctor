import type { Rule, Diagnostic, RuleContext } from "../../types";

export const rel007: Rule = {
  id: "REL-007",
  category: "reliability",
  severity: "warn",
  title: "State not persisted",
  check(ctx: RuleContext): Diagnostic[] {
    const statePattern = /state\s*=\s*\{\}|this\.state|useState|in.memory.*state/i;
    const persistPattern = /redis|postgres|sqlite|dynamodb|firestore|persist|checkpoint/i;

    let hasState = false;
    let hasPersist = false;

    for (const [, content] of ctx.files) {
      if (statePattern.test(content)) hasState = true;
      if (persistPattern.test(content)) hasPersist = true;
    }

    if (hasState && !hasPersist) {
      return [{
        ruleId: "REL-007",
        severity: "warn",
        category: "reliability",
        title: "State not persisted",
        remediation: "Persist agent state to an external store for fault tolerance.",
      }];
    }
    return [];
  },
};
