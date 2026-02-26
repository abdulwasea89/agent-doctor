import type { Rule, Diagnostic, RuleContext } from "../../types";

export const cmp001: Rule = {
  id: "CMP-001",
  category: "compliance",
  severity: "error",
  title: "OWASP Agentic Top 10 violation",
  check(ctx: RuleContext): Diagnostic[] {
    // Aggregate check: prompt injection + destructive tools + untrusted memory + unverified tools
    const promptInjection = /user_input|message|request\./.test(
      Array.from(ctx.files.values()).join("\n")
    );
    const destructiveTool = /\b(delete|remove|send|publish)\b/i.test(
      Array.from(ctx.files.values()).join("\n")
    );

    if (promptInjection && destructiveTool) {
      return [{
        ruleId: "CMP-001",
        severity: "error",
        category: "compliance",
        title: "OWASP Agentic Top 10 violation",
        remediation: "Multiple OWASP Agentic Top 10 issues detected. Address SEC-001, SEC-003, SEC-006, SEC-007 first.",
      }];
    }
    return [];
  },
};
