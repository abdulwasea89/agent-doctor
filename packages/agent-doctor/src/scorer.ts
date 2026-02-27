import type { Diagnostic, DeadTool, DiagnoseResult, Category, DimensionScore, AiAnalysis } from "./types";
import type { ProjectInfo } from "./types";

const WEIGHTS: Record<Category, number> = {
  security: 25,
  reliability: 20,
  config: 20,
  deployment: 15,
  observability: 10,
  compliance: 10,
};

const ERROR_PENALTY = 8;
const WARN_PENALTY = 3;
const DEAD_TOOL_PENALTY = 2;

export function calculateScore(
  diagnostics: Diagnostic[],
  deadTools: DeadTool[],
  projectInfo: ProjectInfo,
  durationMs: number,
  fileCount?: number,
  aiAnalysis?: AiAnalysis
): DiagnoseResult {
  const categories = Object.keys(WEIGHTS) as Category[];

  const dimensions: Record<Category, DimensionScore> = {} as Record<Category, DimensionScore>;

  for (const cat of categories) {
    const weight = WEIGHTS[cat];
    const catDiagnostics = diagnostics.filter((d) => d.category === cat);

    let penalty = 0;
    for (const d of catDiagnostics) {
      penalty += d.severity === "error" ? ERROR_PENALTY : WARN_PENALTY;
    }

    if (cat === "reliability") {
      penalty += deadTools.length * DEAD_TOOL_PENALTY;
    }

    const score = Math.max(0, weight - penalty);
    dimensions[cat] = { score, max: weight };
  }

  const totalScore = Object.values(dimensions).reduce((sum, d) => sum + d.score, 0);
  const score = Math.round(totalScore);

  let label: string;
  if (score >= 75) label = "Great";
  else if (score >= 50) label = "Needs work";
  else label = "Critical";

  return {
    score,
    label,
    dimensions,
    diagnostics,
    files: fileCount,
    deadTools,
    projectInfo,
    durationMs,
    aiAnalysis,
  };
}
