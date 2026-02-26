"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rel014 = void 0;
exports.rel014 = {
    id: "REL-014",
    category: "reliability",
    severity: "warn",
    title: "No failure injection tests",
    check(ctx) {
        const chaosPattern = /chaos|fault.inject|failure.inject|chaos-monkey|toxiproxy/i;
        let found = false;
        for (const [, content] of ctx.files) {
            if (chaosPattern.test(content)) {
                found = true;
                break;
            }
        }
        if (!found) {
            return [{
                    ruleId: "REL-014",
                    severity: "warn",
                    category: "reliability",
                    title: "No failure injection tests",
                    remediation: "Add chaos/fault injection tests to verify system behavior under failure conditions.",
                }];
        }
        return [];
    },
};
//# sourceMappingURL=rel-014.js.map