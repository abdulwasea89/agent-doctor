"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cmp009 = void 0;
exports.cmp009 = {
    id: "CMP-009",
    category: "compliance",
    severity: "error",
    title: "No PCI-DSS controls",
    check(ctx) {
        const paymentPattern = /credit.card|card.number|CVV|CVC|cardholder|PAN\b|payment.card/i;
        const pciPattern = /tokeniz|vault|stripe|braintree|PCI|payment.processor/i;
        let hasPaymentData = false;
        let hasPciControls = false;
        for (const [, content] of ctx.files) {
            if (paymentPattern.test(content))
                hasPaymentData = true;
            if (pciPattern.test(content))
                hasPciControls = true;
        }
        if (hasPaymentData && !hasPciControls) {
            return [{
                    ruleId: "CMP-009",
                    severity: "error",
                    category: "compliance",
                    title: "No PCI-DSS controls",
                    remediation: "Use tokenization and a PCI-compliant payment processor; never store raw card data.",
                }];
        }
        return [];
    },
};
//# sourceMappingURL=cmp-009.js.map