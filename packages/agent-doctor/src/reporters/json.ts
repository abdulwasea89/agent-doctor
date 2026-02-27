import * as fs from "fs";
import * as path from "path";
import type { DiagnoseResult } from "../types";

export function writeJsonReport(
  result: DiagnoseResult,
  outputDir: string
): string {
  const ts = new Date().toISOString().replace(/:/g, "-").split(".")[0];
  const outputPath = path.join(outputDir, `agent-doctor-report-${ts}.json`);
  const content = JSON.stringify(result, null, 2);
  fs.writeFileSync(outputPath, content, "utf-8");
  return outputPath;
}
