import type { Rule, Diagnostic, RuleContext } from "../../types";

export const dep008: Rule = {
  id: "DEP-008",
  category: "deployment",
  severity: "warn",
  title: "No resource limits",
  check(ctx: RuleContext): Diagnostic[] {
    const composeOrK8s = Array.from(ctx.files.keys()).some(f =>
      f.includes("docker-compose") || f.endsWith(".yaml") || f.endsWith(".yml")
    );
    if (!composeOrK8s) return [];

    const resourcePattern = /resources.*limits|limits.*cpu|limits.*memory|mem_limit/i;
    let found = false;

    for (const [file, content] of ctx.files) {
      if (!file.endsWith(".yaml") && !file.endsWith(".yml")) continue;
      if (resourcePattern.test(content)) { found = true; break; }
    }

    if (!found) {
      return [{
        ruleId: "DEP-008",
        severity: "warn",
        category: "deployment",
        title: "No resource limits",
        remediation: "Set CPU and memory limits in your Kubernetes/docker-compose config.",
      }];
    }
    return [];
  },
};
