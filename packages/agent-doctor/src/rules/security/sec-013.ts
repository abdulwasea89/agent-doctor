import type { Rule, Diagnostic, RuleContext } from "../../types";

export const sec013: Rule = {
  id: "SEC-013",
  category: "security",
  severity: "error",
  title: "Process runs as root",
  check(ctx: RuleContext): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const dockerfileContent = ctx.files.get("Dockerfile");
    if (!dockerfileContent) return diagnostics;

    if (!dockerfileContent.includes("USER ") || /USER\s+root/i.test(dockerfileContent)) {
      diagnostics.push({
        ruleId: "SEC-013",
        severity: "error",
        category: "security",
        title: "Process runs as root",
        file: "Dockerfile",
        remediation: "Add a non-root USER directive in your Dockerfile (e.g., USER node).",
      });
    }
    return diagnostics;
  },
};
