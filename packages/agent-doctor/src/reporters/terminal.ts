import type { DiagnoseResult, Diagnostic } from "../types";

// chalk v5 is ESM-only; we use dynamic import to work in CommonJS
let chalk: typeof import("chalk").default | null = null;

async function getChalk() {
  if (!chalk) {
    const mod = await import("chalk");
    chalk = mod.default;
  }
  return chalk;
}

function progressBar(score: number, width = 20): string {
  const filled = Math.round((score / 100) * width);
  const empty = width - filled;
  return "[" + "=".repeat(filled) + " ".repeat(empty) + "]";
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

  console.log();
  console.log(c.bold("  agent-doctor"));
  console.log(c.dim("  Diagnose and harden your AI agents before they hit production."));
  console.log();

  const errors = result.diagnostics.filter((d) => d.severity === "error");
  const warnings = result.diagnostics.filter((d) => d.severity === "warn");

  const grouped = groupByRule(result.diagnostics);

  for (const [ruleId, diags] of grouped) {
    const first = diags[0];
    const isError = first.severity === "error";
    const icon = isError ? c.red("> X") : c.yellow("> !");
    const count = diags.length;

    console.log(`${icon}  ${c.bold(first.title)} ${c.dim(`(${count})`)}`);

    if (verbose) {
      const filesAndLines = diags
        .filter((d) => d.file)
        .map((d) => `${d.file}${d.line ? ":" + d.line : ""}`)
        .join(", ");
      if (filesAndLines) {
        console.log(`     ${c.dim(filesAndLines)}`);
      }
    }
    console.log();
  }

  if (result.deadTools.length > 0) {
    console.log(c.yellow(`> !  Dead tools detected (${result.deadTools.length})`));
    if (verbose) {
      for (const dt of result.deadTools) {
        console.log(`     ${c.dim(dt.name)} — registered in ${c.dim(dt.registeredIn + ":" + dt.registeredAt)}`);
      }
    }
    console.log();
  }

  // Score display
  const scoreColor =
    result.score >= 75 ? c.green : result.score >= 50 ? c.yellow : c.red;

  console.log(`  ${scoreColor(`${result.score} / 100`)}  ${c.bold(result.label)}`);
  console.log(`  ${scoreColor(progressBar(result.score))}`);
  console.log();

  const fileCount = new Set(result.diagnostics.filter((d) => d.file).map((d) => d.file)).size;
  const totalIssues = errors.length + warnings.length;
  const durationSec = (result.durationMs / 1000).toFixed(1);

  console.log(
    c.dim(
      `  ${totalIssues} issue${totalIssues !== 1 ? "s" : ""} across ${fileCount} file${fileCount !== 1 ? "s" : ""} in ${durationSec}s`
    )
  );

  if (totalIssues > 0) {
    console.log();
    console.log(c.dim("  Run agent-doctor . --fix to open suggested fixes."));
  }

  console.log();
}
