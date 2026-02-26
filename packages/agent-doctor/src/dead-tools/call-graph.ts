const INVOCATION_PATTERNS = [
  // Direct function call patterns
  /\binvoke\s*\(\s*["']([^"']+)["']/g,
  /\brun_tool\s*\(\s*["']([^"']+)["']/g,
  /\bcall_tool\s*\(\s*["']([^"']+)["']/g,
  // tools: ["name1", "name2"] or tools=["name1"]
  /tools\s*[:=]\s*\[[^\]]*["']([a-z_][a-z0-9_-]{2,40})["']/g,
  // agent.invoke or chain invocations with tool name
  /\btool_choice\s*[:=]\s*["']([^"']+)["']/g,
  // Python @tool decorated function calls
  /\bawait\s+([a-z_][a-z0-9_]{2,40})\s*\(/g,
];

export function buildCallGraph(files: Map<string, string>): Set<string> {
  const invoked = new Set<string>();

  for (const [file, content] of files) {
    if (
      !file.endsWith(".ts") &&
      !file.endsWith(".js") &&
      !file.endsWith(".py") &&
      !file.endsWith(".mjs")
    ) {
      continue;
    }

    for (const pattern of INVOCATION_PATTERNS) {
      pattern.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(content)) !== null) {
        const name = match[1];
        if (name && name.length >= 3) {
          invoked.add(name);
        }
      }
    }
  }

  return invoked;
}
