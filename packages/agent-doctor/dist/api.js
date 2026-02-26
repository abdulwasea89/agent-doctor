"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.diagnose = diagnose;
const config_1 = require("./config");
const engine_1 = require("./engine");
const scorer_1 = require("./scorer");
async function diagnose(projectPath, options = {}) {
    const start = Date.now();
    const config = (0, config_1.loadConfig)(projectPath);
    // Override config with options
    if (options.threshold !== undefined)
        config.threshold = options.threshold;
    const { diagnostics, deadTools, projectInfo, fileCount } = await (0, engine_1.runEngine)(projectPath, config, {
        audit: options.audit !== false,
        deadTools: options.deadTools !== false,
    });
    const durationMs = Date.now() - start;
    return (0, scorer_1.calculateScore)(diagnostics, deadTools, projectInfo, durationMs, fileCount);
}
//# sourceMappingURL=api.js.map