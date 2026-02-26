"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runEngine = runEngine;
const detector_1 = require("./detector");
const index_1 = require("./rules/index");
const index_2 = require("./dead-tools/index");
// Files that belong to agent-doctor itself — never scan these
const SELF_FILE_PATTERNS = [
    /packages[\\/]agent-doctor[\\/]src[\\/]/,
    /packages[\\/]agent-doctor[\\/]dist[\\/]/,
];
function isSelfFile(file) {
    return SELF_FILE_PATTERNS.some((p) => p.test(file));
}
async function runEngine(projectPath, config, options = {}) {
    const { audit = true, deadTools: runDeadTools = true } = options;
    const projectInfo = await (0, detector_1.detectProject)(projectPath);
    const rawFiles = await (0, detector_1.loadProjectFiles)(projectPath);
    // Strip agent-doctor's own source files from the scan target
    const files = new Map();
    for (const [file, content] of rawFiles) {
        if (!isSelfFile(file))
            files.set(file, content);
    }
    const ctx = { projectPath, files, projectInfo, config };
    const rules = (0, index_1.getApplicableRules)(projectInfo, config);
    // Run both passes in parallel
    const [diagnostics, deadToolsList] = await Promise.all([
        audit ? runAuditPass(ctx, rules) : Promise.resolve([]),
        runDeadTools ? (0, index_2.detectDeadTools)(ctx) : Promise.resolve([]),
    ]);
    // Filter by ignored files
    const filtered = diagnostics.filter((d) => {
        if (!d.file)
            return true;
        return !config.ignore.files.some((pattern) => {
            // Simple glob match: support * wildcard
            const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
            return regex.test(d.file);
        });
    });
    return { diagnostics: filtered, deadTools: deadToolsList, projectInfo, fileCount: files.size };
}
async function runAuditPass(ctx, rules) {
    const results = await Promise.all(rules.map((rule) => {
        try {
            return Promise.resolve(rule.check(ctx));
        }
        catch {
            return Promise.resolve([]);
        }
    }));
    return results.flat();
}
//# sourceMappingURL=engine.js.map