import type { Rule, Diagnostic, RuleContext } from "../../types";

export const rel013: Rule = {
  id: "REL-013",
  category: "reliability",
  severity: "warn",
  title: "Single instance, no redundancy",
  check(ctx: RuleContext): Diagnostic[] {
    const replicaPattern = /replicas\s*:\s*(\d+)/g;
    let hasMultipleReplicas = false;

    for (const [file, content] of ctx.files) {
      if (!file.endsWith(".yaml") && !file.endsWith(".yml")) continue;
      let match: RegExpExecArray | null;
      while ((match = replicaPattern.exec(content)) !== null) {
        if (parseInt(match[1]) > 1) { hasMultipleReplicas = true; break; }
      }
      replicaPattern.lastIndex = 0;
      if (hasMultipleReplicas) break;
    }

    if (!hasMultipleReplicas) {
      return [{
        ruleId: "REL-013",
        severity: "warn",
        category: "reliability",
        title: "Single instance, no redundancy",
        remediation: "Configure at least 2 replicas for production availability.",
      }];
    }
    return [];
  },
};
