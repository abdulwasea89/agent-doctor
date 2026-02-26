import type { Rule } from "../types";
import type { ProjectInfo, AgentDoctorConfig } from "../types";
export declare const ALL_RULES: Rule[];
export declare function getApplicableRules(_projectInfo: ProjectInfo, config: AgentDoctorConfig): Rule[];
