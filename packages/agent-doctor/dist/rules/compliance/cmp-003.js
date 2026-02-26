"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cmp003 = void 0;
exports.cmp003 = {
    id: "CMP-003",
    category: "compliance",
    severity: "warn",
    title: "Output not validated before delivery",
    check(ctx) {
        const outputPattern = /return.*response|send.*response|reply\(|respond\(/i;
        const moderationPattern = /moderat|content.filter|output.filter|safety.check|guardrail/i;
        let hasOutput = false;
        let hasModeration = false;
        for (const [, content] of ctx.files) {
            if (outputPattern.test(content))
                hasOutput = true;
            if (moderationPattern.test(content))
                hasModeration = true;
        }
        if (hasOutput && !hasModeration) {
            return [{
                    ruleId: "CMP-003",
                    severity: "warn",
                    category: "compliance",
                    title: "Output not validated before delivery",
                    remediation: "Add content moderation or output filtering before delivering agent responses.",
                }];
        }
        return [];
    },
};
//# sourceMappingURL=cmp-003.js.map