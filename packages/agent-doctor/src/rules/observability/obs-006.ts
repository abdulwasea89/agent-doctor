import type { Rule, Diagnostic, RuleContext } from "../../types";

export const obs006: Rule = {
  id: "OBS-006",
  category: "observability",
  severity: "warn",
  title: "No request trace ID",
  check(ctx: RuleContext): Diagnostic[] {
    const traceIdPattern = /traceId|trace_id|requestId|request_id|correlationId|uuid\(\)|uuidv4/i;
    let found = false;

    for (const [, content] of ctx.files) {
      if (traceIdPattern.test(content)) { found = true; break; }
    }

    if (!found) {
      return [{
        ruleId: "OBS-006",
        severity: "warn",
        category: "observability",
        title: "No request trace ID",
        remediation: "Generate and propagate a trace/request ID for each agent invocation.",
      }];
    }
    return [];
  },
};
