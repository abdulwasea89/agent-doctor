import type { Rule, Diagnostic, RuleContext } from "../../types";

export const dep009: Rule = {
  id: "DEP-009",
  category: "deployment",
  severity: "error",
  title: "Secrets in container definition",
  check(ctx: RuleContext): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const secretInEnvPattern = /ENV\s+(API_KEY|SECRET|TOKEN|PASSWORD)\s*=\s*\S+/i;

    for (const [file, content] of ctx.files) {
      if (!file.includes("Dockerfile") && !file.endsWith(".yaml") && !file.endsWith(".yml")) continue;
      const lines = content.split("\n");
      lines.forEach((line, i) => {
        if (secretInEnvPattern.test(line)) {
          diagnostics.push({
            ruleId: "DEP-009",
            severity: "error",
            category: "deployment",
            title: "Secrets in container definition",
            file,
            line: i + 1,
            remediation: "Use secrets management (Vault, K8s Secrets, AWS Secrets Manager) instead of ENV.",
          });
        }
      });
    }
    return diagnostics;
  },
};
