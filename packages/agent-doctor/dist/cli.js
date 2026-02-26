#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const config_1 = require("./config");
const engine_1 = require("./engine");
const scorer_1 = require("./scorer");
const terminal_1 = require("./reporters/terminal");
const markdown_1 = require("./reporters/markdown");
const json_1 = require("./reporters/json");
const fix_agent_1 = require("./agents/fix-agent");
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, "../package.json"), "utf-8"));
const program = new commander_1.Command();
program
    .name("agent-doctor")
    .description("Diagnose and harden your AI agents before they hit production.")
    .version(pkg.version)
    .argument("[directory]", "Path to the agent project", ".")
    .option("--no-audit", "Skip the audit rule pass")
    .option("--no-dead-tools", "Skip dead tool detection")
    .option("--verbose", "Show file:line details for each issue")
    .option("--score", "Print only the numeric score (for CI)")
    .option("-y, --yes", "Skip confirmation prompts")
    .option("--project <name>", "Workspace project selector")
    .option("--diff [base]", "Scan only files changed vs base branch")
    .option("--fix", "Generate AI-assisted fix suggestions (requires ANTHROPIC_API_KEY or OPENAI_API_KEY)")
    .option("--output <format>", "Output format: md (default) or json", "md")
    .option("--threshold <n>", "Exit 1 if score is below this value", parseInt)
    .action(async (directory, opts) => {
    const projectPath = path.resolve(directory);
    if (!fs.existsSync(projectPath)) {
        console.error(`Error: directory not found: ${projectPath}`);
        process.exit(1);
    }
    const config = (0, config_1.loadConfig)(projectPath);
    const threshold = opts.threshold ?? config.threshold;
    const outputFormat = opts.output ?? config.output ?? "md";
    if (!["md", "json"].includes(outputFormat)) {
        console.error(`Error: --output must be "md" or "json", got "${outputFormat}"`);
        process.exit(1);
    }
    const start = Date.now();
    const { diagnostics, deadTools, projectInfo, fileCount } = await (0, engine_1.runEngine)(projectPath, config, {
        audit: opts.audit !== false,
        deadTools: opts.deadTools !== false,
    });
    const durationMs = Date.now() - start;
    const result = (0, scorer_1.calculateScore)(diagnostics, deadTools, projectInfo, durationMs, fileCount);
    if (opts.score) {
        // CI mode: just print the number
        console.log(result.score);
    }
    else {
        await (0, terminal_1.renderTerminal)(result, opts.verbose);
        // --fix: run Mastra AI agent to generate fix suggestions
        if (opts.fix) {
            const hasKey = process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY;
            if (!hasKey) {
                console.error("  ✖ --fix requires ANTHROPIC_API_KEY or OPENAI_API_KEY to be set.");
            }
            else {
                console.log("  Generating AI fix suggestions...\n");
                // Build file snippets map for context
                const snippets = new Map();
                for (const d of diagnostics) {
                    if (d.file && !snippets.has(d.file)) {
                        const fullPath = path.join(projectPath, d.file);
                        try {
                            snippets.set(d.file, fs.readFileSync(fullPath, "utf-8").slice(0, 2000));
                        }
                        catch { /* skip */ }
                    }
                }
                const fixes = await (0, fix_agent_1.generateFixes)(result, snippets);
                if (fixes.size > 0) {
                    for (const [ruleId, fix] of fixes) {
                        console.log(`  ─── ${ruleId} ───────────────────────────────`);
                        console.log(fix);
                        console.log();
                    }
                }
                else {
                    console.log("  No AI fixes generated.");
                }
            }
        }
        // Write report
        if (outputFormat === "json") {
            const reportPath = (0, json_1.writeJsonReport)(result, projectPath);
            console.log(`  Report written to: ${reportPath}\n`);
        }
        else {
            const reportPath = (0, markdown_1.writeMarkdownReport)(result, projectPath);
            console.log(`  Report written to: ${reportPath}\n`);
        }
    }
    // Exit with code 1 if below threshold
    if (threshold !== undefined && result.score < threshold) {
        process.exit(1);
    }
});
program.parseAsync(process.argv).catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});
//# sourceMappingURL=cli.js.map