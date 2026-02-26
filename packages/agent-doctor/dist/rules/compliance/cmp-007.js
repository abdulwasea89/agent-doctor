"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cmp007 = void 0;
exports.cmp007 = {
    id: "CMP-007",
    category: "compliance",
    severity: "warn",
    title: "No model card",
    check(ctx) {
        const modelCardPattern = /model.card|MODEL.CARD|model-card/i;
        let found = false;
        for (const file of ctx.files.keys()) {
            if (/model.card|MODEL_CARD/i.test(file) || /README/i.test(file)) {
                const content = ctx.files.get(file) || "";
                if (modelCardPattern.test(content) || modelCardPattern.test(file)) {
                    found = true;
                    break;
                }
            }
        }
        if (!found) {
            return [{
                    ruleId: "CMP-007",
                    severity: "warn",
                    category: "compliance",
                    title: "No model card",
                    remediation: "Create a model card documenting the agent's capabilities, limitations, and intended use.",
                }];
        }
        return [];
    },
};
//# sourceMappingURL=cmp-007.js.map