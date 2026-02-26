export interface RegisteredTool {
  name: string;
  file: string;
  line: number;
}

const REGISTRATION_PATTERNS = [
  // .tool("name", ...) or .tool({ name: "..." })
  /\.tool\s*\(\s*["']([^"']+)["']/g,
  // register_tool("name")
  /register_tool\s*\(\s*["']([^"']+)["']/g,
  // DynamicTool({ name: "..." }) or StructuredTool({ name: "..." }) or Tool({ name: "..." })
  /(?:DynamicTool|StructuredTool|Tool)\s*\(\s*\{[^}]*name\s*:\s*["']([^"']+)["']/g,
  // name: "tool_name" inside tool definition blocks
  /\bname\s*:\s*["']([a-z_][a-z0-9_-]{2,40})["']/g,
];

export function traceRegisteredTools(
  files: Map<string, string>
): Map<string, RegisteredTool> {
  const registered = new Map<string, RegisteredTool>();

  for (const [file, content] of files) {
    // Only scan source files
    if (
      !file.endsWith(".ts") &&
      !file.endsWith(".js") &&
      !file.endsWith(".py") &&
      !file.endsWith(".mjs")
    ) {
      continue;
    }

    const lines = content.split("\n");

    for (const pattern of REGISTRATION_PATTERNS) {
      pattern.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(content)) !== null) {
        const name = match[1];
        if (!name || name.length < 3) continue;
        // Skip common false positives
        if (/^(string|number|boolean|object|array|null|undefined|true|false)$/.test(name)) {
          continue;
        }
        const lineNum = content.substring(0, match.index).split("\n").length;
        if (!registered.has(name)) {
          registered.set(name, { name, file, line: lineNum });
        }
      }
    }
  }

  return registered;
}
