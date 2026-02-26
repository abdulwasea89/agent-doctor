import type { Rule, Diagnostic, RuleContext } from "../../types";

export const cfg008: Rule = {
  id: "CFG-008",
  category: "config",
  severity: "error",
  title: "Duplicate tool names",
  check(ctx: RuleContext): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const toolNamePattern = /name\s*[:=]\s*["']([^"']+)["']/g;
    const toolNames = new Map<string, string[]>();

    for (const [file, content] of ctx.files) {
      let match: RegExpExecArray | null;
      while ((match = toolNamePattern.exec(content)) !== null) {
        const name = match[1];
        if (!toolNames.has(name)) toolNames.set(name, []);
        toolNames.get(name)!.push(file);
      }
      toolNamePattern.lastIndex = 0;
    }

    for (const [name, files] of toolNames) {
      if (files.length > 1) {
        diagnostics.push({
          ruleId: "CFG-008",
          severity: "error",
          category: "config",
          title: "Duplicate tool names",
          remediation: `Tool name "${name}" is registered in multiple files: ${files.join(", ")}. Use unique names.`,
        });
      }
    }
    return diagnostics;
  },
};
