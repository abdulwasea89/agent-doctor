"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obs012 = void 0;
exports.obs012 = {
    id: "OBS-012",
    category: "observability",
    severity: "warn",
    title: "No user feedback signal",
    check(ctx) {
        const feedbackPattern = /thumbs|rating|feedback|upvote|downvote|helpful|satisfaction/i;
        let found = false;
        for (const [, content] of ctx.files) {
            if (feedbackPattern.test(content)) {
                found = true;
                break;
            }
        }
        if (!found) {
            return [{
                    ruleId: "OBS-012",
                    severity: "warn",
                    category: "observability",
                    title: "No user feedback signal",
                    remediation: "Collect user feedback (thumbs up/down, ratings) to evaluate agent quality.",
                }];
        }
        return [];
    },
};
//# sourceMappingURL=obs-012.js.map