import type { Rule, Diagnostic, RuleContext } from "../../types";

export const sec001: Rule = {
  id: "SEC-001",
  category: "security",
  severity: "error",
  title: "Prompt injection risk in tool input",
  protectionKey: "prompt-injection",
  check(ctx: RuleContext): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    
    const unsafePatterns = [
      /user[_\.]?input/i,
      /message\s*\./,
      /request\s*\./,
      /param\s*\./,
      /args\s*\./,
      /query\s*\./,
      /body\s*\./,
    ];
    
    const safePatterns = [
      /sanitize/i,
      /guardrail/i,
      /validate/i,
      /escape/i,
      /encode/i,
      /replace.*[^a-zA-Z0-9]/i,
      /\.\s*slice\s*\(\s*0\s*/,
    ];

    for (const [file, content] of ctx.files) {
      const hasUnsafe = unsafePatterns.some(p => p.test(content));
      const hasSafe = safePatterns.some(p => p.test(content));
      
      if (hasUnsafe && !hasSafe) {
        const lines = content.split("\n");
        for (let i = 0; i < lines.length; i++) {
          if (unsafePatterns.some(p => p.test(lines[i]))) {
            diagnostics.push({
              ruleId: "SEC-001",
              severity: "error",
              category: "security",
              title: "Prompt injection risk in tool input",
              file,
              line: i + 1,
              remediation: "Sanitize or validate user-controlled input before passing to tools. Use input validation, escaping, or guardrails.",
            });
            break;
          }
        }
      }
    }
    return diagnostics;
  },
};
