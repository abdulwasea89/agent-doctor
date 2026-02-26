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
exports.renderTerminal = renderTerminal;
let chalk = null;
async function getChalk() {
    if (!chalk)
        chalk = (await Promise.resolve().then(() => __importStar(require("chalk")))).default;
    return chalk;
}
const BOX_WIDTH = 54; // inner content width (between │ │)
function pad(str, width) {
    // Strip ANSI codes to measure visible length
    const visible = str.replace(/\x1b\[[0-9;]*m/g, "");
    const spaces = Math.max(0, width - visible.length);
    return str + " ".repeat(spaces);
}
function boxLine(inner) {
    return `  │ ${pad(inner, BOX_WIDTH)} │`;
}
function boxBlank() {
    return `  │ ${" ".repeat(BOX_WIDTH)} │`;
}
function boxTop() {
    return `  ┌${"─".repeat(BOX_WIDTH + 2)}┐`;
}
function boxBottom() {
    return `  └${"─".repeat(BOX_WIDTH + 2)}┘`;
}
function buildProgressBar(score, width = 48) {
    const filled = Math.round((score / 100) * width);
    const empty = width - filled;
    return "█".repeat(filled) + "░".repeat(empty);
}
function groupByRule(diagnostics) {
    const map = new Map();
    for (const d of diagnostics) {
        if (!map.has(d.ruleId))
            map.set(d.ruleId, []);
        map.get(d.ruleId).push(d);
    }
    return map;
}
async function renderTerminal(result, verbose = false) {
    const c = await getChalk();
    const errors = result.diagnostics.filter((d) => d.severity === "error");
    const warnings = result.diagnostics.filter((d) => d.severity === "warn");
    const totalIssues = errors.length + warnings.length;
    const fileCount = new Set(result.diagnostics.filter((d) => d.file).map((d) => d.file)).size;
    const totalFiles = result.files ?? fileCount;
    const durationSec = (result.durationMs / 1000).toFixed(0) + "ms";
    // ── Issue list (outside box) ─────────────────────────────
    console.log();
    const grouped = groupByRule(result.diagnostics);
    for (const [, diags] of grouped) {
        const first = diags[0];
        const isError = first.severity === "error";
        const icon = isError ? c.red("✖") : c.yellow("⚠");
        const count = diags.length;
        console.log(` ${icon} ${c.bold(first.title)} ${c.dim(`(${count})`)}`);
        if (verbose && diags.some((d) => d.file)) {
            const locs = diags
                .filter((d) => d.file)
                .map((d) => c.dim(`${d.file}${d.line ? ":" + d.line : ""}`));
            // Print up to 3 locations per rule
            for (const loc of locs.slice(0, 3)) {
                console.log(`   ${loc}`);
            }
            if (locs.length > 3)
                console.log(c.dim(`   ...and ${locs.length - 3} more`));
        }
    }
    if (result.deadTools.length > 0) {
        console.log(` ${c.yellow("⚠")} ${c.bold("Dead tools detected")} ${c.dim(`(${result.deadTools.length})`)}`);
        if (verbose) {
            for (const dt of result.deadTools.slice(0, 3)) {
                console.log(c.dim(`   ${dt.name} — ${dt.registeredIn}:${dt.registeredAt}`));
            }
        }
    }
    // ── Score box ────────────────────────────────────────────
    console.log();
    console.log(boxTop());
    console.log(boxBlank());
    // Robot face
    console.log(boxLine(" ┌─────┐"));
    console.log(boxLine(" │ ◠ ◠ │"));
    console.log(boxLine(" │  ▽  │"));
    console.log(boxLine(" └─────┘"));
    // Brand
    console.log(boxLine(c.bold(" agent-doctor")));
    console.log(boxBlank());
    // Score line
    const scoreColor = result.score >= 75 ? c.green : result.score >= 50 ? c.yellow : c.red;
    const scoreLabel = `${result.score} / 100  ${result.label}`;
    console.log(boxLine(` ${scoreColor(c.bold(scoreLabel))}`));
    console.log(boxBlank());
    // Progress bar
    const bar = buildProgressBar(result.score, BOX_WIDTH - 2);
    const coloredBar = scoreColor(bar);
    console.log(boxLine(` ${coloredBar}`));
    console.log(boxBlank());
    // Summary line
    const errStr = errors.length > 0 ? c.red(`✖ ${errors.length} errors`) : "";
    const warnStr = warnings.length > 0 ? c.yellow(`⚠ ${warnings.length} warnings`) : "";
    const parts = [errStr, warnStr].filter(Boolean).join("  ");
    const filePart = c.dim(`across ${fileCount}/${totalFiles} files  in ${durationSec}`);
    console.log(boxLine(` ${parts}  ${filePart}`));
    console.log(boxBottom());
    console.log();
    if (totalIssues > 0) {
        console.log(c.dim("  Run agent-doctor . --fix for AI-assisted fixes"));
        console.log();
    }
}
//# sourceMappingURL=terminal.js.map