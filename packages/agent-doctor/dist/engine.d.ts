import type { Diagnostic, AgentDoctorConfig, DeadTool, ProjectInfo } from "./types";
export interface EngineResult {
    diagnostics: Diagnostic[];
    deadTools: DeadTool[];
    projectInfo: ProjectInfo;
    fileCount: number;
}
export declare function runEngine(projectPath: string, config: AgentDoctorConfig, options?: {
    audit?: boolean;
    deadTools?: boolean;
}): Promise<EngineResult>;
