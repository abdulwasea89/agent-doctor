import * as fs from "fs";
import * as path from "path";
import type { DiagnoseResult, Category } from "../types";

const CATEGORY_LABELS: Record<Category, string> = {
  security: "Security",
  config: "Config",
  deployment: "Deployment",
  reliability: "Reliability",
  observability: "Observability",
  compliance: "Compliance",
};

export function writeMarkdownReport(
  result: DiagnoseResult,
  outputDir: string
): string {
  const outputPath = path.join(outputDir, "agent-doctor-report.md");

  const lines: string[] = [];
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
    const label = CATEGORY_LABELS[cat as Category] ?? cat;
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
