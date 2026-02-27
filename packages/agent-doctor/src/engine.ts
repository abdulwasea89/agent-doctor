import * as path from "path";
import type { Diagnostic, RuleContext, AgentDoctorConfig, DeadTool, ProjectInfo, AiAnalysis } from "./types";
import { detectProject, loadProjectFiles } from "./detector";
import { getApplicableRules } from "./rules/index";
import { detectDeadTools } from "./dead-tools/index";
import { checkProtection } from "./analysis/protection-registry";
import { runAiAnalysis, applyAiAnalysis } from "./agents/ai-analyst";

export interface EngineResult {
  diagnostics: Diagnostic[];
  deadTools: DeadTool[];
  projectInfo: ProjectInfo;
  fileCount: number;
  aiAnalysis?: AiAnalysis;
}

export interface RunEngineOptions {
  rules?: boolean;
  aiVerify?: boolean;
  deepAnalysis?: boolean;
  deadTools?: boolean;
}

const SELF_SRC_DIR = path.resolve(__dirname);

function buildSelfFilter(projectPath: string): (relFile: string) => boolean {
  const resolvedProjectPath = path.resolve(projectPath);
  
  if (!resolvedProjectPath.startsWith(SELF_SRC_DIR + path.sep) && resolvedProjectPath !== SELF_SRC_DIR) {
    return () => false;
  }
  
  return (relFile: string) => {
    const abs = path.resolve(projectPath, relFile);
    return abs.startsWith(SELF_SRC_DIR + path.sep) || abs === SELF_SRC_DIR;
  };
}

export async function runEngine(
  projectPath: string,
  config: AgentDoctorConfig,
  options: RunEngineOptions = {}
): Promise<EngineResult> {
  const { 
    rules = true, 
    aiVerify = false, 
    deepAnalysis = false,
    deadTools: runDeadTools = true 
  } = options;

  const projectInfo = await detectProject(projectPath);
  const t0 = Date.now();
  process.stderr.write(`  Scanning files...         `);
  const rawFiles = await loadProjectFiles(projectPath);

  const isSelfFile = buildSelfFilter(projectPath);
  const files = new Map<string, string>();
  for (const [file, content] of rawFiles) {
    if (!isSelfFile(file)) files.set(file, content);
  }
  process.stderr.write(`✓  ${files.size} files  ${Date.now() - t0}ms\n`);

  const ctx: RuleContext = { projectPath, files, projectInfo, config, deepAnalysis };

  let diagnostics: Diagnostic[] = [];
  let deadToolsList: DeadTool[] = [];

  if (rules) {
    const applicableRules = getApplicableRules(projectInfo, config, deepAnalysis);
    
    process.stderr.write(`  Running static rules...   `);
    const t1 = Date.now();
    
    const ruleResults = await Promise.all([
      runAuditPass(ctx, applicableRules),
      runDeadTools ? detectDeadTools(ctx) : Promise.resolve([])
    ]);
    
    diagnostics = ruleResults[0];
    deadToolsList = ruleResults[1] as DeadTool[];
    
    process.stderr.write(`✓  ${diagnostics.length} findings  ${Date.now() - t1}ms\n`);
  }

  let aiAnalysis: AiAnalysis | undefined;
  if (aiVerify) {
    process.stderr.write(`  AI verifying findings...  `);
    const analysis = await runAiAnalysis(diagnostics, files);
    if (analysis) {
      aiAnalysis = analysis;
      const newCount = analysis.additionalFindings.length;
      process.stderr.write(
        `✓  ${analysis.confirmedCount} confirmed  ${analysis.dismissedCount} dismissed  ${newCount} new\n`
      );
    } else {
      process.stderr.write(`─  skipped (no API key)\n`);
    }
  } else if (rules) {
    process.stderr.write(`  AI verification...        −  skipped (not enabled, use --ai to enable)\n`);
  }

  return { diagnostics, deadTools: deadToolsList, projectInfo, fileCount: files.size, aiAnalysis };
}

async function runAuditPass(
  ctx: RuleContext,
  rules: ReturnType<typeof getApplicableRules>
): Promise<Diagnostic[]> {
  const allSourceCode = Array.from(ctx.files.values()).join("\n");

  const results = await Promise.all(
    rules.map((rule) => {
      try {
        let diagnostics = rule.check(ctx);

        if (diagnostics.length > 0 && rule.protectionKey) {
          const protection = checkProtection(allSourceCode, rule.protectionKey);

          if (protection.found) {
            if (protection.confidence >= 70) {
              return [];
            }
            if (protection.confidence >= 40) {
              diagnostics = diagnostics.map((d) => ({
                ...d,
                severity: "warn" as const,
                remediation: `${d.remediation} (Note: Possible protection: ${protection.matchedPatterns[0]})`,
              }));
            }
          }
        }

        return diagnostics;
      } catch {
        return [];
      }
    })
  );
  return results.flat();
}
