import type { Rule, Diagnostic, RuleContext } from "../../types";

export const sec005: Rule = {
  id: "SEC-005",
  category: "security",
  severity: "warn",
  title: "Excessive agent permissions",
  check(ctx: RuleContext): Diagnostic[] {
    // This rule flags when tool count is very high (>20) suggesting over-permissioned agent
    const diagnostics: Diagnostic[] = [];
    if (ctx.projectInfo.toolCount > 20) {
      diagnostics.push({
        ruleId: "SEC-005",
        severity: "warn",
        category: "security",
        title: "Excessive agent permissions",
        remediation: `Agent has ${ctx.projectInfo.toolCount} tools registered. Review and remove unused tools to follow least-privilege principle.`,
      });
    }
    return diagnostics;
  },
};
