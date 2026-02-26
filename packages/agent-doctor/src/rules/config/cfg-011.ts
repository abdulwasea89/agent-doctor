import type { Rule, Diagnostic, RuleContext } from "../../types";

export const cfg011: Rule = {
  id: "CFG-011",
  category: "config",
  severity: "warn",
  title: "No input schema on tools",
  check(ctx: RuleContext): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const toolDefPattern = /DynamicTool|StructuredTool|@tool\b|\.tool\(/;
    const schemaPattern = /z\.object|BaseModel|inputSchema|parameters.*schema|zod\./i;

    for (const [file, content] of ctx.files) {
      if (!toolDefPattern.test(content)) continue;
      if (!schemaPattern.test(content)) {
        diagnostics.push({
          ruleId: "CFG-011",
          severity: "warn",
          category: "config",
          title: "No input schema on tools",
          file,
          remediation: "Define input schemas for tools using Zod, Pydantic, or JSON Schema.",
        });
      }
    }
    return diagnostics;
  },
};
