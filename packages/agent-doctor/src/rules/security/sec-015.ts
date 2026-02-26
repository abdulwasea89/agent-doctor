import type { Rule, Diagnostic, RuleContext } from "../../types";

export const sec015: Rule = {
  id: "SEC-015",
  category: "security",
  severity: "warn",
  title: "Cross-agent trust not validated",
  check(ctx: RuleContext): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const multiAgentPattern = /agent\.send|agent\.call|delegate|sub_agent|subagent/i;
    const trustPattern = /signature|verify|identity|authenticate|trusted/i;

    for (const [file, content] of ctx.files) {
      if (!multiAgentPattern.test(content)) continue;
      if (!trustPattern.test(content)) {
        diagnostics.push({
          ruleId: "SEC-015",
          severity: "warn",
          category: "security",
          title: "Cross-agent trust not validated",
          file,
          remediation: "Validate agent identity/signatures when delegating between agents.",
        });
      }
    }
    return diagnostics;
  },
};
