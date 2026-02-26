import type { Diagnostic, RuleContext, AgentDoctorConfig, DeadTool, ProjectInfo } from "./types";
import { detectProject, loadProjectFiles } from "./detector";
import { getApplicableRules } from "./rules/index";
import { detectDeadTools } from "./dead-tools/index";

export interface EngineResult {
  diagnostics: Diagnostic[];
  deadTools: DeadTool[];
  projectInfo: ProjectInfo;
}

export async function runEngine(
  projectPath: string,
  config: AgentDoctorConfig,
  options: { audit?: boolean; deadTools?: boolean } = {}
): Promise<EngineResult> {
  const { audit = true, deadTools: runDeadTools = true } = options;

  const projectInfo = await detectProject(projectPath);
  const files = await loadProjectFiles(projectPath);

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

  return { diagnostics: filtered, deadTools: deadToolsList, projectInfo };
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
