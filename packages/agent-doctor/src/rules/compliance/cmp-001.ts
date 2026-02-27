import type { Rule, Diagnostic, RuleContext } from "../../types";

export const cmp001: Rule = {
  id: "CMP-001",
  category: "compliance",
  severity: "error",
  title: "OWASP Agentic Top 10 violation",
  check(ctx: RuleContext): Diagnostic[] {
    const codeFiles: [string, string][] = [];
    for (const [file, content] of ctx.files) {
      if (!file.endsWith('.md') && !file.endsWith('.txt') && !file.endsWith('.yaml') && !file.endsWith('.yml')) {
        codeFiles.push([file, content]);
      }
    }
    
    let hasPromptInjection = false;
    let hasDestructiveTool = false;
    
    for (const [file, content] of codeFiles) {
      if (/user_input|req\.body|req\.query|req\.params/i.test(content)) {
        hasPromptInjection = true;
      }
      if (/\b(delete|remove|unlink|rmdir)\b/i.test(content) && !/confirm|FORCE/i.test(content)) {
        hasDestructiveTool = true;
      }
    }

    if (hasPromptInjection && hasDestructiveTool) {
      return [{
        ruleId: "CMP-001",
        severity: "error",
        category: "compliance",
        title: "OWASP Agentic Top 10 violation",
        remediation: "Multiple OWASP Agentic Top 10 issues detected. Address SEC-001, SEC-003, SEC-006, SEC-007 first.",
      }];
    }
    return [];
  },
};
