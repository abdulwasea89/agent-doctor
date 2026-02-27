export interface ProtectionConfig {
  patterns: RegExp[];
  minMatches: number;
  confidenceBoost: number;
}

export const PROTECTION_REGISTRY: Record<string, ProtectionConfig> = {
  // ===== SECURITY =====
  "prompt-injection": {
    patterns: [
      /sanitize.*input/i,
      /INJECTION_PATTERNS/i,
      /filter.*prompt/i,
      /validateToolInput/i,
      /guardrail/i,
      /dompurify/i,
      /zod.*\.safeParse/,
    ],
    minMatches: 1,
    confidenceBoost: 40,
  },
  "input-length": {
    patterns: [
      /maxInputLen|max_input_len|MAX_INPUT_LEN/i,
      /maxLength.*\d+/i,
      /input\.length\s*>\s*\d+/,
      /truncate|slice\(0,\s*\d+\)/i,
    ],
    minMatches: 1,
    confidenceBoost: 35,
  },
  "env-validation": {
    patterns: [
      /REQUIRED_ENV.*=.*\[/i,
      /process\.env\[.*\]\s*\|\|\s*(process\.exit|throw)/i,
      /if\s*\(\s*!process\.env\[/,
    ],
    minMatches: 1,
    confidenceBoost: 40,
  },
  "human-oversight": {
    patterns: [
      /humanOversight|human_oversight/i,
      /humanInTheLoop|human_in_the_loop/i,
      /requiresApproval|requires_approval/i,
      /HIGH_STAKES/i,
      /approvalWorkflow/i,
    ],
    minMatches: 1,
    confidenceBoost: 35,
  },

  // ===== RELIABILITY =====
  "circuit-breaker": {
    patterns: [
      /CircuitBreaker|circuitBreaker/i,
      /opossum|cockatiel/i,
      /isOpen\(\)|recordFailure|recordSuccess/i,
    ],
    minMatches: 1,
    confidenceBoost: 40,
  },
  "retry-logic": {
    patterns: [
      /withRetry|retry\s*\(/i,
      /exponential.*backoff/i,
      /p-retry|async-retry/i,
      /attempts?\s*[<>=]\s*\d+/,
    ],
    minMatches: 1,
    confidenceBoost: 40,
  },
  "graceful-shutdown": {
    patterns: [
      /SIGINT|SIGTERM/i,
      /isShuttingDown|shuttingDown/i,
      /gracefulShutdown|graceful_shutdown/i,
    ],
    minMatches: 2,
    confidenceBoost: 30,
  },
  "recursion-guard": {
    patterns: [
      /isShuttingDown\s*\)\s*return/i,
      /if\s*\(\s*\w+Running\s*\)\s*return/i,
      /while\s*\(/,
      /depth\s*[>=]/,
      /if\s*\(\s*\w+\s*\)\s*return\s*;/,
    ],
    minMatches: 1,
    confidenceBoost: 40,
  },
  "max-iterations": {
    patterns: [
      /maxIterations|max_iterations|MAX_ITERATIONS/i,
      /iterationCount|iteration_count/i,
    ],
    minMatches: 1,
    confidenceBoost: 35,
  },

  // ===== CONFIG =====
  "system-prompt": {
    patterns: [
      /SYSTEM_PROMPT|system_prompt/i,
      /instructions\s*:/i,
      /systemMessage|system_message/i,
    ],
    minMatches: 1,
    confidenceBoost: 40,
  },
  "fallback-model": {
    patterns: [
      /fallbackAgent|fallback_agent/i,
      /fallbackModel|FALLBACK_MODEL/i,
      /backup.*model|secondary.*model/i,
    ],
    minMatches: 1,
    confidenceBoost: 35,
  },
  "stream-config": {
    patterns: [
      /streamEnabled|stream_enabled|STREAM_ENABLED/i,
      /\.stream\(/,
      /stream\s*:\s*(true|1)/i,
    ],
    minMatches: 1,
    confidenceBoost: 35,
  },

  // ===== OBSERVABILITY =====
  "structured-logging": {
    patterns: [
      /winston|pino|bunyan/i,
      /createLogger|getLogger/i,
      /logger\.(info|warn|error)\s*\(/i,
    ],
    minMatches: 1,
    confidenceBoost: 40,
  },
  "cost-tracking": {
    patterns: [
      /costTracker|cost_tracker/i,
      /totalTokens|tokenCount/i,
      /estimatedUSD|token.*budget/i,
    ],
    minMatches: 1,
    confidenceBoost: 35,
  },
  "error-tracking": {
    patterns: [
      /Sentry\.|captureException/i,
      /Datadog|Rollbar|Bugsnag/i,
    ],
    minMatches: 1,
    confidenceBoost: 40,
  },
  "health-check": {
    patterns: [
      /healthCheck|health_check/i,
      /\/health|\/ping|\/status/i,
    ],
    minMatches: 1,
    confidenceBoost: 40,
  },
  "slo-tracking": {
    patterns: [
      /p99|p95|percentile/i,
      /SLO\s*=|slo\./i,
      /latenc(y|ies)/i,
      /errorRate|error_rate/i,
    ],
    minMatches: 1,
    confidenceBoost: 35,
  },
  "tool-alerting": {
    patterns: [
      /withToolAlert|toolAlert/i,
      /onToolError|toolErrorHandler/i,
      /captureException.*tool/i,
    ],
    minMatches: 1,
    confidenceBoost: 40,
  },
};

export interface ProtectionResult {
  found: boolean;
  confidence: number;
  matchedPatterns: string[];
}

export function checkProtection(
  sourceCode: string,
  protectionKey: string
): ProtectionResult {
  const config = PROTECTION_REGISTRY[protectionKey];
  if (!config) return { found: false, confidence: 0, matchedPatterns: [] };

  const matchedPatterns: string[] = [];

  for (const pattern of config.patterns) {
    if (pattern.test(sourceCode)) {
      matchedPatterns.push(pattern.source);
    }
  }

  const found = matchedPatterns.length >= config.minMatches;

  if (found) {
    const patternRatio = matchedPatterns.length / config.patterns.length;
    const confidence = Math.min(100, 50 + (patternRatio * 50) + config.confidenceBoost);
    return { found: true, confidence: Math.round(confidence), matchedPatterns };
  }

  return { found: false, confidence: 0, matchedPatterns: [] };
}

export function checkAllProtections(sourceCode: string): Record<string, ProtectionResult> {
  const results: Record<string, ProtectionResult> = {};
  
  for (const key of Object.keys(PROTECTION_REGISTRY)) {
    results[key] = checkProtection(sourceCode, key);
  }
  
  return results;
}
