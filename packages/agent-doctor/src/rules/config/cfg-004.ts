import type { Rule, Diagnostic, RuleContext } from "../../types";

export const cfg004: Rule = {
  id: "CFG-004",
  category: "config",
  severity: "error",
  title: "MCP schema invalid",
  check(ctx: RuleContext): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    if (!ctx.projectInfo.mcpCompliant) return diagnostics;

    for (const [file, content] of ctx.files) {
      if (!file.endsWith(".json")) continue;
      try {
        const data = JSON.parse(content) as Record<string, unknown>;
        // Check for MCP tool schema structure
        if (data.tools && Array.isArray(data.tools)) {
          const tools = data.tools as Array<Record<string, unknown>>;
          for (const tool of tools) {
            if (!tool.name || !tool.description || !tool.inputSchema) {
              diagnostics.push({
                ruleId: "CFG-004",
                severity: "error",
                category: "config",
                title: "MCP schema invalid",
                file,
                remediation: "Ensure all MCP tools have name, description, and inputSchema fields.",
              });
              break;
            }
          }
        }
      } catch {
        // ignore non-JSON files
      }
    }
    return diagnostics;
  },
};
