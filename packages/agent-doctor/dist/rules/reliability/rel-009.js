"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rel009 = void 0;
exports.rel009 = {
    id: "REL-009",
    category: "reliability",
    severity: "warn",
    title: "No circuit breaker",
    check(ctx) {
        const circuitPattern = /circuit.*breaker|CircuitBreaker|pybreaker|opossum|resilience4j|braker/i;
        let found = false;
        for (const [, content] of ctx.files) {
            if (circuitPattern.test(content)) {
                found = true;
                break;
            }
        }
        if (!found) {
            return [{
                    ruleId: "REL-009",
                    severity: "warn",
                    category: "reliability",
                    title: "No circuit breaker",
                    remediation: "Implement circuit breakers to prevent cascade failures from downstream service outages.",
                }];
        }
        return [];
    },
};
//# sourceMappingURL=rel-009.js.map