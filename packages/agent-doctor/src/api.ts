import { loadConfig } from "./config";
import { runEngine } from "./engine";
import { calculateScore } from "./scorer";
import type { DiagnoseResult, DiagnoseOptions } from "./types";

export async function diagnose(
  projectPath: string,
  options: DiagnoseOptions = {}
): Promise<DiagnoseResult> {
  const start = Date.now();
  const config = loadConfig(projectPath);

  // Override config with options
  if (options.threshold !== undefined) config.threshold = options.threshold;

  const { diagnostics, deadTools, projectInfo, fileCount } = await runEngine(
    projectPath,
    config,
    {
      audit: options.audit !== false,
      deadTools: options.deadTools !== false,
    }
  );

  const durationMs = Date.now() - start;
  return calculateScore(diagnostics, deadTools, projectInfo, durationMs, fileCount);
}

// Re-export types for consumers
export type { Diagnostic, ProjectInfo, DiagnoseResult, DiagnoseOptions, DeadTool } from "./types";
