import type { Rule, Diagnostic, RuleContext } from "../../types";

export const cfg014: Rule = {
  id: "CFG-014",
  category: "config",
  severity: "warn",
  title: "Memory backend unreachable at startup",
  check(ctx: RuleContext): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    if (ctx.projectInfo.memoryBackend === "none") return diagnostics;

    const healthCheckPattern = /ping\(|health.*check|\.connect\(\)|isAlive|checkConnection/i;
    let hasHealthCheck = false;

    for (const [, content] of ctx.files) {
      if (healthCheckPattern.test(content)) {
        hasHealthCheck = true;
        break;
      }
    }

    if (!hasHealthCheck) {
      diagnostics.push({
        ruleId: "CFG-014",
        severity: "warn",
        category: "config",
        title: "Memory backend unreachable at startup",
        remediation: `Add a connectivity health check for ${ctx.projectInfo.memoryBackend} at startup.`,
      });
    }
    return diagnostics;
  },
};
