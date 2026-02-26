import type { Diagnostic, DeadTool, DiagnoseResult } from "./types";
import type { ProjectInfo } from "./types";
export declare function calculateScore(diagnostics: Diagnostic[], deadTools: DeadTool[], projectInfo: ProjectInfo, durationMs: number, fileCount?: number): DiagnoseResult;
