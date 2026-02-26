import type { Rule, Diagnostic, RuleContext } from "../../types";

export const cmp005: Rule = {
  id: "CMP-005",
  category: "compliance",
  severity: "error",
  title: "No HIPAA safeguards",
  check(ctx: RuleContext): Diagnostic[] {
    const healthKeywords = /patient|diagnosis|medical.record|PHI|HIPAA|healthcare|prescription/i;
    const hipaaPattern = /encrypt|BAA|audit.log|access.control|HIPAA/i;

    let hasHealthData = false;
    let hasHipaaSafeguards = false;

    for (const [, content] of ctx.files) {
      if (healthKeywords.test(content)) hasHealthData = true;
      if (hipaaPattern.test(content)) hasHipaaSafeguards = true;
    }

    if (hasHealthData && !hasHipaaSafeguards) {
      return [{
        ruleId: "CMP-005",
        severity: "error",
        category: "compliance",
        title: "No HIPAA safeguards",
        remediation: "Implement encryption, audit logging, and access controls for HIPAA-covered data.",
      }];
    }
    return [];
  },
};
