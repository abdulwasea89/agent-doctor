import type { DeadTool, RuleContext } from "../types";
import { traceRegisteredTools } from "./import-tracer";
import { buildCallGraph } from "./call-graph";

export async function detectDeadTools(ctx: RuleContext): Promise<DeadTool[]> {
  const registered = traceRegisteredTools(ctx.files);
  const invoked = buildCallGraph(ctx.files);

  const deadTools: DeadTool[] = [];

  for (const [name, info] of registered) {
    if (!invoked.has(name)) {
      deadTools.push({
        name,
        registeredIn: info.file,
        registeredAt: info.line,
      });
    }
  }

  return deadTools;
}
