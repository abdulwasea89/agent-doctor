"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectDeadTools = detectDeadTools;
const import_tracer_1 = require("./import-tracer");
const call_graph_1 = require("./call-graph");
async function detectDeadTools(ctx) {
    const registered = (0, import_tracer_1.traceRegisteredTools)(ctx.files);
    const invoked = (0, call_graph_1.buildCallGraph)(ctx.files);
    const deadTools = [];
    for (const [name, info] of registered) {
        if (!invoked.has(name)) {
            deadTools.push({
                name,
                registeredIn: info.file,
                registeredAt: info.line,
            });
        }
    }
    return deadTools;
}
//# sourceMappingURL=index.js.map