import type { DiagnoseResult, Diagnostic, Category } from "../types";

let chalk: typeof import("chalk").default | null = null;
async function getChalk() {
  if (!chalk) chalk = (await import("chalk")).default;
  return chalk;
}

// Responsive: fit terminal width, min 54, max 80 inner chars
function getBoxWidth(): number {
  const cols = process.stdout.columns;
  if (!cols || cols <= 0) return 54;
  return Math.min(Math.max(cols - 8, 54), 80);
}

// Strip ANSI codes to measure printable length
function visLen(s: string): number {
  // eslint-disable-next-line no-control-regex
  return s.replace(/\x1b\[[0-9;]*m/g, "").length;
}

function pad(str: string, width: number): string {
  return str + " ".repeat(Math.max(0, width - visLen(str)));
}

function box(inner: string, w: number): string {
  return `  │ ${pad(inner, w)} │`;
}
function blank(w: number): string {
  return `  │ ${" ".repeat(w)} │`;
}
function top(w: number): string {
  return `  ┌${"─".repeat(w + 2)}┐`;
}
function bottom(w: number): string {
  return `  └${"─".repeat(w + 2)}┘`;
}
function sep(w: number): string {
  return `  ├${"─".repeat(w + 2)}┤`;
}
function bar(score: number, width: number): string {
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

function groupByCategory(diagnostics: Diagnostic[]): Map<Category, Diagnostic[]> {
  const map = new Map<Category, Diagnostic[]>();
  for (const d of diagnostics) {
    if (!map.has(d.category)) map.set(d.category, []);
    map.get(d.category)!.push(d);
  }
  return map;
}

const CATEGORY_ORDER: Category[] = ["security", "reliability", "config", "observability", "compliance", "deployment"];

export async function renderTerminal(
  result: DiagnoseResult,
  verbose = false
): Promise<void> {
  const c = await getChalk();
  const W = getBoxWidth();

  const errors   = result.diagnostics.filter((d) => d.severity === "error");
  const warnings = result.diagnostics.filter((d) => d.severity === "warn");
  const totalIssues = errors.length + warnings.length;
  const affectedFiles = new Set(result.diagnostics.filter((d) => d.file).map((d) => d.file)).size;
  const totalFiles = result.files ?? affectedFiles;
  const duration = result.durationMs < 1000
    ? `${result.durationMs}ms`
    : `${(result.durationMs / 1000).toFixed(1)}s`;

  console.log();

  // ── Issues list ────────────────────────────────────────────
  const byCategory = groupByCategory(result.diagnostics);
  const sortedCats = CATEGORY_ORDER.filter((cat) => byCategory.has(cat));

  for (const cat of sortedCats) {
    const catDiags = byCategory.get(cat)!;
    const label = cat.toUpperCase();
    // Section header width matches box width
    const dashes = "─".repeat(Math.max(2, W - label.length - 4));
    console.log(c.dim(`  ── ${label} ${dashes}`));
    console.log();

    for (const [, diags] of groupByRule(catDiags)) {
      const first = diags[0];
      const isError = first.severity === "error";
      const locs = diags.filter((d) => d.file);

      if (verbose && locs.length > 0) {
        const icon  = isError ? c.red("v") : c.yellow("v");
        const title = isError ? c.red(c.bold(first.title)) : c.yellow(c.bold(first.title));
        console.log(`  ${icon}  ${title} ${c.dim(`(${locs.length})`)}`);
        for (const d of locs) {
          console.log(`     ${c.dim(`${d.file}${d.line ? ":" + d.line : ""}`)}`);
        }
        if (first.suggestion) {
          console.log(`     ${c.cyan("→")} ${c.cyan(first.suggestion)}`);
        }
        console.log();
      } else {
        const icon  = isError ? `${c.red(">")} ${c.red("X")}` : `${c.yellow(">")} ${c.yellow("!")}`;
        console.log(`  ${icon}  ${c.bold(first.title)} ${c.dim(`(${diags.length})`)}`);
        console.log();
      }
    }
  }

  // Dead tools
  if (result.deadTools.length > 0) {
    if (verbose) {
      console.log(`  ${c.yellow("v")}  ${c.yellow(c.bold("Dead tools"))} ${c.dim(`(${result.deadTools.length})`)}`);
      for (const dt of result.deadTools) {
        console.log(`     ${c.dim(`${dt.name}  —  ${dt.registeredIn}:${dt.registeredAt}`)}`);
      }
    } else {
      console.log(`  ${c.yellow(">")} ${c.yellow("!")}  ${c.bold("Dead tools detected")} ${c.dim(`(${result.deadTools.length})`)}`);
    }
    console.log();
  }

  // ── Score box ──────────────────────────────────────────────
  const scoreColor = result.score >= 75 ? c.green : result.score >= 50 ? c.yellow : c.red;
  const barWidth   = Math.max(20, W - 2);

  console.log(top(W));
  console.log(blank(W));
  console.log(box(" ┌─────┐", W));
  console.log(box(" │ ◠ ◠ │", W));
  console.log(box(" │  ▽  │", W));
  console.log(box(" └─────┘", W));
  console.log(blank(W));
  console.log(box(c.bold(" agent-doctor"), W));
  console.log(blank(W));
  console.log(box(` ${scoreColor(c.bold(`${result.score} / 100  ${result.label}`))}`, W));
  console.log(blank(W));
  console.log(box(` ${scoreColor(bar(result.score, barWidth))}`, W));
  console.log(blank(W));

  // Summary — two lines to avoid overflow
  const errPart  = errors.length   > 0 ? c.red(`✖ ${errors.length} error${errors.length !== 1 ? "s" : ""}`)       : "";
  const warnPart = warnings.length > 0 ? c.yellow(`⚠ ${warnings.length} warning${warnings.length !== 1 ? "s" : ""}`) : "";
  const issueParts = [errPart, warnPart].filter(Boolean).join("  ");
  if (issueParts) {
    console.log(box(` ${issueParts}`, W));
  }
  console.log(box(
    ` ${c.dim(`${affectedFiles} affected  ·  ${totalFiles} scanned  ·  ${duration}`)}`,
    W
  ));

  // AI section
  if (result.aiAnalysis) {
    const ai = result.aiAnalysis;
    console.log(sep(W));
    console.log(box(` ${c.cyan("AI")}  ${c.dim(ai.modelUsed)}  ·  ${c.dim(ai.tokensUsed.toLocaleString() + " tokens")}`, W));
    const confirmed = ai.confirmedCount > 0 ? c.green(`${ai.confirmedCount} confirmed`) : c.dim("0 confirmed");
    const dismissed = ai.dismissedCount > 0 ? c.dim(`${ai.dismissedCount} dismissed`) : c.dim("0 dismissed");
    const newF      = ai.additionalFindings.length > 0 ? c.yellow(`${ai.additionalFindings.length} new`) : c.dim("0 new");
    console.log(box(`     ${confirmed}  ·  ${dismissed}  ·  ${newF}`, W));
    if (ai.summary) {
      // Wrap summary to box width
      const words = ai.summary.split(" ");
      let line = " ";
      for (const word of words) {
        if ((line + word).length > W - 2) {
          console.log(box(c.dim(line), W));
          line = " " + word + " ";
        } else {
          line += word + " ";
        }
      }
      if (line.trim()) console.log(box(c.dim(line.trimEnd()), W));
    }
  }

  console.log(bottom(W));
  console.log();

  if (totalIssues > 0) {
    console.log(c.dim("  --verbose  show file locations & suggestions"));
    console.log(c.dim("  --fix      AI-assisted fixes"));
    console.log();
  }
}
