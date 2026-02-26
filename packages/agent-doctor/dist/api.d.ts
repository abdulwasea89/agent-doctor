import type { DiagnoseResult, DiagnoseOptions } from "./types";
export declare function diagnose(projectPath: string, options?: DiagnoseOptions): Promise<DiagnoseResult>;
export type { Diagnostic, ProjectInfo, DiagnoseResult, DiagnoseOptions, DeadTool } from "./types";
