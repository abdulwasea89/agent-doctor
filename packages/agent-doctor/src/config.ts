import * as fs from "fs";
import * as path from "path";
import type { AgentDoctorConfig } from "./types";

const DEFAULT_CONFIG: AgentDoctorConfig = {
  ignore: {
    rules: [],
    files: [],
  },
};

export function loadConfig(projectPath: string): AgentDoctorConfig {
  // Try agent-doctor.config.json first
  const configFile = path.join(projectPath, "agent-doctor.config.json");
  if (fs.existsSync(configFile)) {
    try {
      const raw = fs.readFileSync(configFile, "utf-8");
      const parsed = JSON.parse(raw) as Partial<AgentDoctorConfig>;
      return mergeConfig(parsed);
    } catch {
      // fall through
    }
  }

  // Try agentDoctor key in package.json
  const pkgFile = path.join(projectPath, "package.json");
  if (fs.existsSync(pkgFile)) {
    try {
      const raw = fs.readFileSync(pkgFile, "utf-8");
      const pkg = JSON.parse(raw) as Record<string, unknown>;
      if (pkg.agentDoctor && typeof pkg.agentDoctor === "object") {
        return mergeConfig(pkg.agentDoctor as Partial<AgentDoctorConfig>);
      }
    } catch {
      // fall through 
    }
  }

  return { ...DEFAULT_CONFIG, ignore: { rules: [], files: [] } };
}

function mergeConfig(partial: Partial<AgentDoctorConfig>): AgentDoctorConfig {
  return {
    ignore: {
      rules: partial.ignore?.rules ?? [],
      files: partial.ignore?.files ?? [],
    },
    threshold: partial.threshold,
    output: partial.output,
  };
}
