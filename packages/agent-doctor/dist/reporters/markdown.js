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
exports.writeMarkdownReport = writeMarkdownReport;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const CATEGORY_LABELS = {
    security: "Security",
    config: "Config",
    deployment: "Deployment",
    reliability: "Reliability",
    observability: "Observability",
    compliance: "Compliance",
};
function writeMarkdownReport(result, outputDir) {
    const outputPath = path.join(outputDir, "agent-doctor-report.md");
    const lines = [];
    const date = new Date().toISOString().split("T")[0];
    lines.push("# agent-doctor Report");
    lines.push("");
    lines.push(`**Date:** ${date}`);
    lines.push(`**Framework:** ${result.projectInfo.framework}`);
    lines.push(`**Model Provider:** ${result.projectInfo.modelProvider}`);
    lines.push(`**Language:** ${result.projectInfo.language}`);
    lines.push(`**Tools detected:** ${result.projectInfo.toolCount}`);
    lines.push(`**Memory backend:** ${result.projectInfo.memoryBackend}`);
    lines.push(`**Scan duration:** ${(result.durationMs / 1000).toFixed(1)}s`);
    lines.push("");
    // Score
    lines.push("## Health Score");
    lines.push("");
    lines.push(`**${result.score} / 100** — ${result.label}`);
    lines.push("");
    // Dimension table
    lines.push("| Category | Score | Max |");
    lines.push("|---|---|---|");
    for (const [cat, dim] of Object.entries(result.dimensions)) {
        const label = CATEGORY_LABELS[cat] ?? cat;
        lines.push(`| ${label} | ${dim.score} | ${dim.max} |`);
    }
    lines.push("");
    // Issues
    const errors = result.diagnostics.filter((d) => d.severity === "error");
    const warnings = result.diagnostics.filter((d) => d.severity === "warn");
    if (errors.length > 0) {
        lines.push("## Errors");
        lines.push("");
        for (const d of errors) {
            lines.push(`### 🔴 ${d.title}`);
            lines.push(`**Rule:** \`${d.ruleId}\` | **Category:** ${CATEGORY_LABELS[d.category]}`);
            if (d.file) {
                lines.push(`**Location:** \`${d.file}${d.line ? ":" + d.line : ""}\``);
            }
            lines.push(`**Fix:** ${d.remediation}`);
            lines.push("");
        }
    }
    if (warnings.length > 0) {
        lines.push("## Warnings");
        lines.push("");
        for (const d of warnings) {
            lines.push(`### 🟡 ${d.title}`);
            lines.push(`**Rule:** \`${d.ruleId}\` | **Category:** ${CATEGORY_LABELS[d.category]}`);
            if (d.file) {
                lines.push(`**Location:** \`${d.file}${d.line ? ":" + d.line : ""}\``);
            }
            lines.push(`**Fix:** ${d.remediation}`);
            lines.push("");
        }
    }
    // Dead tools
    if (result.deadTools.length > 0) {
        lines.push("## Dead Tools");
        lines.push("");
        lines.push("Tools that are registered but never invoked:");
        lines.push("");
        for (const dt of result.deadTools) {
            lines.push(`- \`${dt.name}\` — registered in \`${dt.registeredIn}:${dt.registeredAt}\``);
        }
        lines.push("");
    }
    const content = lines.join("\n");
    fs.writeFileSync(outputPath, content, "utf-8");
    return outputPath;
}
//# sourceMappingURL=markdown.js.map