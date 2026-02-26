import type { Rule, Diagnostic, RuleContext } from "../../types";

export const cfg009: Rule = {
  id: "CFG-009",
  category: "config",
  severity: "warn",
  title: "Tool description too vague",
  check(ctx: RuleContext): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const descPattern = /description\s*[:=]\s*["']([^"']{1,50})["']/g;

    for (const [file, content] of ctx.files) {
      let match: RegExpExecArray | null;
      while ((match = descPattern.exec(content)) !== null) {
        const desc = match[1].trim();
        const wordCount = desc.split(/\s+/).length;
        if (wordCount < 10) {
          const lineNum = content.substring(0, match.index).split("\n").length;
          diagnostics.push({
            ruleId: "CFG-009",
            severity: "warn",
            category: "config",
            title: "Tool description too vague",
            file,
            line: lineNum,
            remediation: `Tool description "${desc}" has only ${wordCount} words. Provide at least 10 words for LLM to understand tool purpose.`,
          });
        }
      }
      descPattern.lastIndex = 0;
    }
    return diagnostics;
  },
};
