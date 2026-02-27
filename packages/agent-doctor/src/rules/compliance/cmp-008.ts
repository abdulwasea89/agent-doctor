import type { Rule, Diagnostic, RuleContext } from "../../types";

export const cmp008: Rule = {
  id: "CMP-008",
  category: "compliance",
  severity: "error",
  title: "No human oversight for high-stakes",
  protectionKey: "human-oversight",
  check(ctx: RuleContext): Diagnostic[] {
    const highStakePattern = /payment|transaction|medical.decision|legal.advice|prescri|diagnos/i;
    const humanOversightPattern = /human.review|human.approval|escalate|human.in.the.loop|HITL/i;

    let hasHighStake = false;
    let hasOversight = false;

    for (const [, content] of ctx.files) {
      if (highStakePattern.test(content)) hasHighStake = true;
      if (humanOversightPattern.test(content)) hasOversight = true;
    }

    if (hasHighStake && !hasOversight) {
      return [{
        ruleId: "CMP-008",
        severity: "error",
        category: "compliance",
        title: "No human oversight for high-stakes",
        remediation: "Add human-in-the-loop review for financial, medical, or legal decisions.",
      }];
    }
    return [];
  },
};
