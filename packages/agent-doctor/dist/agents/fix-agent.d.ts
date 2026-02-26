import { Agent } from "@mastra/core/agent";
import type { DiagnoseResult } from "../types";
export declare function createFixAgent(): Agent | null;
export declare function generateFixes(result: DiagnoseResult, fileSnippets: Map<string, string>): Promise<Map<string, string>>;
