import type { Diagnostic, RuleContext, AgentDoctorConfig, DeadTool, ProjectInfo } from "./types";
import { detectProject, loadProjectFiles } from "./detector";
import { getApplicableRules } from "./rules/index";
import { detectDeadTools } from "./dead-tools/index";

export interface EngineResult {
  diagnostics: Diagnostic[];
  deadTools: DeadTool[];
  projectInfo: ProjectInfo;
  fileCount: number;
}

// Files that belong to agent-doctor itself — never scan these
const SELF_FILE_PATTERNS = [
  /packages[\\/]agent-doctor[\\/]src[\\/]/,
  /packages[\\/]agent-doctor[\\/]dist[\\/]/,
];

function isSelfFile(file: string): boolean {
  return SELF_FILE_PATTERNS.some((p) => p.test(file));
}

export async function runEngine(
  projectPath: string,
  config: AgentDoctorConfig,
  options: { audit?: boolean; deadTools?: boolean } = {}
): Promise<EngineResult> {
  const { audit = true, deadTools: runDeadTools = true } = options;

  const projectInfo = await detectProject(projectPath);
  const rawFiles = await loadProjectFiles(projectPath);

  // Strip agent-doctor's own source files from the scan target
  const files = new Map<string, string>();
  for (const [file, content] of rawFiles) {
    if (!isSelfFile(file)) files.set(file, content);
  }

  const ctx: RuleContext = { projectPath, files, projectInfo, config };

  const rules = getApplicableRules(projectInfo, config);

  // Run both passes in parallel
  const [diagnostics, deadToolsList] = await Promise.all([
    audit ? runAuditPass(ctx, rules) : Promise.resolve([]),
    runDeadTools ? detectDeadTools(ctx) : Promise.resolve([]),
  ]);

  // Filter by ignored files
  const filtered = diagnostics.filter((d) => {
    if (!d.file) return true;
    return !config.ignore.files.some((pattern) => {
      // Simple glob match: support * wildcard
      const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
      return regex.test(d.file!);
    });
  });

  return { diagnostics: filtered, deadTools: deadToolsList, projectInfo, fileCount: files.size };
}

async function runAuditPass(
  ctx: RuleContext,
  rules: ReturnType<typeof getApplicableRules>
): Promise<Diagnostic[]> {
  const results = await Promise.all(
    rules.map((rule) => {
      try {
        return Promise.resolve(rule.check(ctx));
      } catch {
        return Promise.resolve([]);
      }
    })
  );
  return results.flat();
}
