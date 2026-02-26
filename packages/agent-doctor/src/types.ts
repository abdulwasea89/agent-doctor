export type Severity = "error" | "warn";

export type Category =
  | "security"
  | "config"
  | "deployment"
  | "reliability"
  | "observability"
  | "compliance";

export interface Diagnostic {
  ruleId: string;
  severity: Severity;
  category: Category;
  title: string;
  file?: string;
  line?: number;
  column?: number;
  remediation: string;
}

export interface DeadTool {
  name: string;
  registeredIn: string;
  registeredAt: number;
}

export interface ProjectInfo {
  framework: string;
  modelProvider: string;
  toolCount: number;
  memoryBackend: string;
  mcpCompliant: boolean;
  language: string;
  projectPath: string;
}

export interface AgentDoctorConfig {
  ignore: {
    rules: string[];
    files: string[];
  };
  threshold?: number;
  output?: string;
}

export interface RuleContext {
  projectPath: string;
  files: Map<string, string>;
  projectInfo: ProjectInfo;
  config: AgentDoctorConfig;
}

export interface Rule {
  id: string;
  category: Category;
  severity: Severity;
  title: string;
  check(ctx: RuleContext): Diagnostic[];
}

export interface DimensionScore {
  score: number;
  max: number;
}

export interface DiagnoseResult {
  score: number;
  label: string;
  dimensions: Record<Category, DimensionScore>;
  diagnostics: Diagnostic[];
  deadTools: DeadTool[];
  projectInfo: ProjectInfo;
  durationMs: number;
}

export interface DiagnoseOptions {
  audit?: boolean;
  deadTools?: boolean;
  output?: string;
  verbose?: boolean;
  threshold?: number;
}
