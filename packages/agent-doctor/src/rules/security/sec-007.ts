import type { Rule, Diagnostic, RuleContext } from "../../types";

export const sec007: Rule = {
  id: "SEC-007",
  category: "security",
  severity: "warn",
  title: "Unverified third-party tool",
  check(ctx: RuleContext): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const pkgContent = ctx.files.get("package.json");
    if (!pkgContent) return diagnostics;

    try {
      const pkg = JSON.parse(pkgContent) as {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
      const unpinned = Object.entries(allDeps).filter(([, v]) =>
        /^[\^~]/.test(v) || v === "latest" || v === "*"
      );
      if (unpinned.length > 0) {
        diagnostics.push({
          ruleId: "SEC-007",
          severity: "warn",
          category: "security",
          title: "Unverified third-party tool",
          file: "package.json",
          remediation: `${unpinned.length} dependencies use floating version ranges. Pin exact versions to prevent supply-chain attacks.`,
        });
      }
    } catch {
      // ignore parse errors
    }
    return diagnostics;
  },
};
