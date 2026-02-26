import type { DiagnoseResult, Diagnostic } from "../types";

let chalk: typeof import("chalk").default | null = null;
async function getChalk() {
  if (!chalk) chalk = (await import("chalk")).default;
  return chalk;
}

const BOX_WIDTH = 54;

function pad(str: string, width: number): string {
  const visible = str.replace(/\x1b\[[0-9;]*m/g, "");
  const spaces = Math.max(0, width - visible.length);
  return str + " ".repeat(spaces);
}

function boxLine(inner: string): string {
  return `  │ ${pad(inner, BOX_WIDTH)} │`;
}
function boxBlank(): string {
  return `  │ ${" ".repeat(BOX_WIDTH)} │`;
}
function boxTop(): string {
  return `  ┌${"─".repeat(BOX_WIDTH + 2)}┐`;
}
function boxBottom(): string {
  return `  └${"─".repeat(BOX_WIDTH + 2)}┘`;
}
function buildProgressBar(score: number, width = 50): string {
  const filled = Math.round((score / 100) * width);
  return "█".repeat(filled) + "░".repeat(width - filled);
}

function groupByRule(diagnostics: Diagnostic[]): Map<string, Diagnostic[]> {
  const map = new Map<string, Diagnostic[]>();
  for (const d of diagnostics) {
    if (!map.has(d.ruleId)) map.set(d.ruleId, []);
    map.get(d.ruleId)!.push(d);
  }
  return map;
}

export async function renderTerminal(
  result: DiagnoseResult,
  verbose = false
): Promise<void> {
  const c = await getChalk();

  const errors = result.diagnostics.filter((d) => d.severity === "error");
  const warnings = result.diagnostics.filter((d) => d.severity === "warn");
  const totalIssues = errors.length + warnings.length;
  const fileCount = new Set(
    result.diagnostics.filter((d) => d.file).map((d) => d.file)
  ).size;
  const totalFiles = result.files ?? fileCount;
  const duration = result.durationMs < 1000
    ? `${result.durationMs}ms`
    : `${(result.durationMs / 1000).toFixed(1)}s`;

  console.log();

  const grouped = groupByRule(result.diagnostics);

  for (const [, diags] of grouped) {
    const first = diags[0];
    const isError = first.severity === "error";
    const locs = diags.filter((d) => d.file);
    const hasLocs = locs.length > 0;

    if (verbose && hasLocs) {
      // ── Expanded: "v  Title (n)" then indented file:line rows
      const arrow = isError ? c.red("v") : c.yellow("v");
      const title = isError ? c.red(c.bold(first.title)) : c.yellow(c.bold(first.title));
      console.log(`  ${arrow}  ${title} ${c.dim(`(${locs.length})`)}`);

      for (const d of locs) {
        const loc = `${d.file}${d.line ? ":" + d.line : ""}`;
        console.log(`     ${c.dim(loc)}`);
      }
      console.log();
    } else {
      // ── Collapsed: "> X  Title (n)"
      if (isError) {
        console.log(`  ${c.red(">")} ${c.red("X")}  ${c.bold(first.title)} ${c.dim(`(${diags.length})`)}`);
      } else {
        console.log(`  ${c.yellow(">")} ${c.yellow("!")}  ${c.bold(first.title)} ${c.dim(`(${diags.length})`)}`);
      }
      console.log();
    }
  }

  // Dead tools — always shown as collapsed/expanded
  if (result.deadTools.length > 0) {
    if (verbose) {
      console.log(`  ${c.yellow("v")}  ${c.yellow(c.bold("Dead tools detected"))} ${c.dim(`(${result.deadTools.length})`)}`);
      for (const dt of result.deadTools) {
        console.log(`     ${c.dim(`${dt.name}  —  ${dt.registeredIn}:${dt.registeredAt}`)}`);
      }
    } else {
      console.log(`  ${c.yellow(">")} ${c.yellow("!")}  ${c.bold("Dead tools detected")} ${c.dim(`(${result.deadTools.length})`)}`);
    }
    console.log();
  }

  // ── Score box ─────────────────────────────────────────────
  console.log(boxTop());
  console.log(boxBlank());
  console.log(boxLine(" ┌─────┐"));
  console.log(boxLine(" │ ◠ ◠ │"));
  console.log(boxLine(" │  ▽  │"));
  console.log(boxLine(" └─────┘"));
  console.log(boxBlank());
  console.log(boxLine(c.bold(" agent-doctor")));
  console.log(boxBlank());

  const scoreColor = result.score >= 75 ? c.green : result.score >= 50 ? c.yellow : c.red;
  console.log(boxLine(` ${scoreColor(c.bold(`${result.score} / 100  ${result.label}`))}`));
  console.log(boxBlank());

  const bar = buildProgressBar(result.score);
  console.log(boxLine(` ${scoreColor(bar)}`));
  console.log(boxBlank());

  const errPart  = errors.length   > 0 ? c.red(`✖ ${errors.length} errors`)     : "";
  const warnPart = warnings.length > 0 ? c.yellow(`⚠ ${warnings.length} warnings`) : "";
  const parts = [errPart, warnPart].filter(Boolean).join("  ");
  const summary = `${parts}  ${c.dim(`across ${fileCount}/${totalFiles} files  in ${duration}`)}`;
  console.log(boxLine(` ${summary}`));

  console.log(boxBottom());
  console.log();

  if (totalIssues > 0) {
    console.log(c.dim("  Run agent-doctor . --verbose to see file locations"));
    console.log(c.dim("  Run agent-doctor . --fix    for AI-assisted fixes"));
    console.log();
  }
}
