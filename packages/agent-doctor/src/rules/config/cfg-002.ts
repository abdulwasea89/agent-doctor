import type { Rule, Diagnostic, RuleContext } from "../../types";

export const cfg002: Rule = {
  id: "CFG-002",
  category: "config",
  severity: "warn",
  title: "No memory TTL",
  check(ctx: RuleContext): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const memoryPattern = /redis|pinecone|chroma|weaviate|memory|MemoryStore/i;
    const ttlPattern = /ttl|expiry|expire|expiresIn|EX\s+\d/i;

    for (const [file, content] of ctx.files) {
      if (!memoryPattern.test(content)) continue;
      if (!ttlPattern.test(content)) {
        diagnostics.push({
          ruleId: "CFG-002",
          severity: "warn",
          category: "config",
          title: "No memory TTL",
          file,
          remediation: "Set a TTL on memory entries to prevent unbounded data accumulation.",
        });
      }
    }
    return diagnostics;
  },
};
