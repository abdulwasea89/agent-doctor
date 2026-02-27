#!/usr/bin/env node

// Load .env from the monorepo root (two levels up from dist/)
// e.g. packages/agent-doctor/dist/cli.js → root is ../../../
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// Try root-level .env first, then cwd
const rootEnv = path.resolve(__dirname, "../../../.env");
const cwdEnv = path.resolve(process.cwd(), ".env");
if (fs.existsSync(rootEnv)) {
  dotenv.config({ path: rootEnv });
} else if (fs.existsSync(cwdEnv)) {
  dotenv.config({ path: cwdEnv });
}

import { Command } from "commander";
import { loadConfig } from "./config";
import { runEngine } from "./engine";
import { calculateScore } from "./scorer";
import { renderTerminal } from "./reporters/terminal";
import { writeMarkdownReport } from "./reporters/markdown";
import { writeJsonReport } from "./reporters/json";
import { generateFixes } from "./agents/fix-agent";

const pkg = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../package.json"), "utf-8")
) as { version: string };

const program = new Command();

program
  .name("agent-doctor")
  .description("Diagnose and harden your AI agents before they hit production.")
  .version(pkg.version)
  .argument("[directory]", "Path to the agent project", ".")
  .option("--no-rules", "Skip static rule analysis (not recommended)")
  .option("--ai", "Add AI verification on top of static analysis (requires API key)")
  .option("--deep", "Enable deep static analysis for atom-level error detection")
  .option("--no-dead-tools", "Skip dead tool detection")
  .option("--verbose", "Show file:line details for each issue")
  .option("--score", "Print only the numeric score (for CI)")
  .option("-y, --yes", "Skip confirmation prompts")
  .option("--project <name>", "Workspace project selector")
  .option("--diff [base]", "Scan only files changed vs base branch")
  .option("--fix", "Generate AI-assisted fix suggestions (requires API key)")
  .option("--output <format>", "Output format: md (default) or json", "md")
  .option("--threshold <n>", "Exit 1 if score is below this value", parseInt)
  .action(async (directory: string, opts: {
    rules: boolean;
    ai: boolean;
    deep: boolean;
    deadTools: boolean;
    verbose: boolean;
    score: boolean;
    yes: boolean;
    project?: string;
    diff?: string | boolean;
    fix: boolean;
    output: string;
    threshold?: number;
  }) => {
    const projectPath = (directory === "." && process.env.INIT_CWD && process.env.INIT_CWD !== process.cwd())
      ? process.env.INIT_CWD
      : path.resolve(directory);

    if (!fs.existsSync(projectPath)) {
      console.error(`Error: directory not found: ${projectPath}`);
      process.exit(1);
    }

    const config = loadConfig(projectPath);
    const threshold = opts.threshold ?? config.threshold;
    const outputFormat = opts.output ?? config.output ?? "md";

    if (!["md", "json"].includes(outputFormat)) {
      console.error(`Error: --output must be "md" or "json", got "${outputFormat}"`);
      process.exit(1);
    }

    const start = Date.now();

    const { diagnostics, deadTools, projectInfo, fileCount, aiAnalysis } = await runEngine(
      projectPath,
      config,
      {
        rules: opts.rules !== false,
        aiVerify: opts.ai,
        deepAnalysis: opts.deep,
        deadTools: opts.deadTools,
      }
    );

    const durationMs = Date.now() - start;
    const result = calculateScore(diagnostics, deadTools, projectInfo, durationMs, fileCount, aiAnalysis);

    if (opts.score) {
      console.log(result.score);
    } else {
      await renderTerminal(result, opts.verbose);

      if (opts.fix) {
        const hasKey = process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY;
        if (!hasKey) {
          console.error("  ✖ --fix requires ANTHROPIC_API_KEY or OPENAI_API_KEY to be set.");
        } else {
          console.log("  Generating AI fix suggestions...\n");
          const snippets = new Map<string, string>();
          for (const d of diagnostics) {
            if (d.file && !snippets.has(d.file)) {
              const fullPath = path.join(projectPath, d.file);
              try {
                snippets.set(d.file, fs.readFileSync(fullPath, "utf-8").slice(0, 2000));
              } catch { /* skip */ }
            }
          }
          const fixes = await generateFixes(result, snippets);
          if (fixes.size > 0) {
            for (const [ruleId, fix] of fixes) {
              console.log(`  ─── ${ruleId} ───────────────────────────────`);
              console.log(fix);
              console.log();
            }
          } else {
            console.log("  No AI fixes generated.");
          }
        }
      }

      if (outputFormat === "json") {
        const reportPath = writeJsonReport(result, projectPath);
        console.log(`  Report written to: ${reportPath}\n`);
      } else {
        const reportPath = writeMarkdownReport(result, projectPath);
        console.log(`  Report written to: ${reportPath}\n`);
      }
    }

    if (threshold !== undefined && result.score < threshold) {
      process.exit(1);
    }
  });

program.parseAsync(process.argv).catch((err: unknown) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
