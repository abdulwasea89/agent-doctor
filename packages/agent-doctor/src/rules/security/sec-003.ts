import type { Rule, Diagnostic, RuleContext } from "../../types";

export const sec003: Rule = {
  id: "SEC-003",
  category: "security",
  severity: "error",
  title: "Destructive tool without confirmation",
  check(ctx: RuleContext): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    
    const destructivePatterns = [
      /\bdelete\b/i,
      /\bremove\b/i,
      /\bunlink\b/i,
      /\brmdir\b/i,
      /\brm\s*\(/i,
      /\bdestroy\b/i,
    ];
    
    const safePatterns = [
      /\bconfirm\b/i,
      /\bapproval\b/i,
      /\bapprove\b/i,
      /\bFORCE\b/,
      /\bDRY_RUN\b/,
      /\brequireConfirm\b/i,
      /\bconfirmAction\b/i,
      /\bif\s*\(\s*!.*FORCE/i,
      /\bthrow.*Confirmation/i,
    ];

    for (const [file, content] of ctx.files) {
      if (file.endsWith('.md') || file.endsWith('.txt') || file.endsWith('.yaml') || file.endsWith('.yml')) {
        continue;
      }
      
      const hasDestructive = destructivePatterns.some(p => p.test(content));
      const hasConfirmation = safePatterns.some(p => p.test(content));
      
      if (hasDestructive && !hasConfirmation) {
        const lines = content.split("\n");
        for (let i = 0; i < lines.length; i++) {
          if (destructivePatterns.some(p => p.test(lines[i]))) {
            diagnostics.push({
              ruleId: "SEC-003",
              severity: "error",
              category: "security",
              title: "Destructive tool without confirmation",
              file,
              line: i + 1,
              remediation: "Add a confirmation step (confirmAction, FORCE flag, or requireConfirm) before destructive operations.",
            });
            break;
          }
        }
      }
    }
    return diagnostics;
  },
};
