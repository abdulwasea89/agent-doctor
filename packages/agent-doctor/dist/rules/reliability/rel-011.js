"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rel011 = void 0;
exports.rel011 = {
    id: "REL-011",
    category: "reliability",
    severity: "warn",
    title: "No checkpointing",
    check(ctx) {
        const multiStepPattern = /step_\d|steps\s*=\s*\[|pipeline|workflow|chain/i;
        const checkpointPattern = /checkpoint|resume|save.*state|load.*state/i;
        let hasMultiStep = false;
        let hasCheckpoint = false;
        for (const [, content] of ctx.files) {
            if (multiStepPattern.test(content))
                hasMultiStep = true;
            if (checkpointPattern.test(content))
                hasCheckpoint = true;
        }
        if (hasMultiStep && !hasCheckpoint) {
            return [{
                    ruleId: "REL-011",
                    severity: "warn",
                    category: "reliability",
                    title: "No checkpointing",
                    remediation: "Add checkpoint/resume logic for multi-step pipelines to recover from failures.",
                }];
        }
        return [];
    },
};
//# sourceMappingURL=rel-011.js.map