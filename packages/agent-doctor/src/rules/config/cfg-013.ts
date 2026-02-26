import type { Rule, Diagnostic, RuleContext } from "../../types";

export const cfg013: Rule = {
  id: "CFG-013",
  category: "config",
  severity: "warn",
  title: "No agent version metadata",
  check(ctx: RuleContext): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const versionPattern = /["']version["']\s*:/;

    const pkgContent = ctx.files.get("package.json");
    if (pkgContent && versionPattern.test(pkgContent)) return diagnostics;

    const pyprojectContent = ctx.files.get("pyproject.toml");
    if (pyprojectContent && /^version\s*=/m.test(pyprojectContent)) return diagnostics;

    diagnostics.push({
      ruleId: "CFG-013",
      severity: "warn",
      category: "config",
      title: "No agent version metadata",
      remediation: "Add a version field to your package.json or pyproject.toml to track agent versions.",
    });
    return diagnostics;
  },
};
