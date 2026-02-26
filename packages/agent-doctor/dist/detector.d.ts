import type { ProjectInfo } from "./types";
export declare function detectProject(projectPath: string): Promise<ProjectInfo>;
export declare function loadProjectFiles(projectPath: string): Promise<Map<string, string>>;
