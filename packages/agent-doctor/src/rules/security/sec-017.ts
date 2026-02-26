import type { Rule, Diagnostic, RuleContext } from "../../types";

export const sec017: Rule = {
  id: "SEC-017",
  category: "security",
  severity: "error",
  title: "No SSRF protection",
  check(ctx: RuleContext): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const urlFetchPattern = /fetch\(.*url|requests\.get\(|httpx\.get\(|axios\.get\(/;
    const ssrfPattern = /allowlist|allowedDomains|allowed_domains|isPrivateIP|ip.*check|domain.*whitelist/i;

    for (const [file, content] of ctx.files) {
      if (!urlFetchPattern.test(content)) continue;
      if (!ssrfPattern.test(content)) {
        diagnostics.push({
          ruleId: "SEC-017",
          severity: "error",
          category: "security",
          title: "No SSRF protection",
          file,
          remediation: "Add IP range checks or domain allowlist before fetching user-supplied URLs.",
        });
      }
    }
    return diagnostics;
  },
};
