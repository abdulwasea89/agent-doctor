import type { Rule, Diagnostic, RuleContext } from "../../types";

export const rel008: Rule = {
  id: "REL-008",
  category: "reliability",
  severity: "warn",
  title: "No load testing",
  check(ctx: RuleContext): Diagnostic[] {
    const loadTestPattern = /locust|k6|artillery|jmeter|gatling|load.test|perf.test/i;
    let found = false;

    for (const [, content] of ctx.files) {
      if (loadTestPattern.test(content)) { found = true; break; }
    }
    for (const file of ctx.files.keys()) {
      if (/locustfile|k6|artillery/.test(file)) { found = true; break; }
    }

    if (!found) {
      return [{
        ruleId: "REL-008",
        severity: "warn",
        category: "reliability",
        title: "No load testing",
        remediation: "Add load tests (k6, locust, artillery) to validate agent performance under load.",
      }];
    }
    return [];
  },
};
