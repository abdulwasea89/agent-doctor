import type { Rule, Diagnostic, RuleContext } from "../../types";

export const rel002: Rule = {
  id: "REL-002",
  category: "reliability",
  severity: "error",
  title: "Recursive tool call loop",
  check(ctx: RuleContext): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    // Simple heuristic: detect if a tool definition contains a call to itself
    const toolDefPattern = /function\s+(\w+)|const\s+(\w+)\s*=.*=>/g;

    for (const [file, content] of ctx.files) {
      let match: RegExpExecArray | null;
      while ((match = toolDefPattern.exec(content)) !== null) {
        const name = match[1] || match[2];
        if (!name) continue;
        // Check if the function body calls itself
        const funcStart = match.index;
        const nextChunk = content.substring(funcStart, funcStart + 500);
        const selfCallCount = (nextChunk.match(new RegExp(`\\b${name}\\s*\\(`, "g")) || []).length;
        if (selfCallCount > 1) {
          const lineNum = content.substring(0, match.index).split("\n").length;
          diagnostics.push({
            ruleId: "REL-002",
            severity: "error",
            category: "reliability",
            title: "Recursive tool call loop",
            file,
            line: lineNum,
            remediation: `Function "${name}" may call itself recursively. Add a depth guard or base case.`,
          });
        }
      }
      toolDefPattern.lastIndex = 0;
    }
    return diagnostics;
  },
};
