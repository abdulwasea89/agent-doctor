const INJECTION_PATTERNS = [
  /ignore (all )?previous instructions?/gi,
  /disregard (all )?previous/gi,
  /you are now/gi,
  /new (system )?prompt:/gi,
  /<\/?system>/gi,
  /\[INST\]/gi,
  /act as (a|an) .{0,30} with no restrictions/gi,
  /jailbreak/gi,
];

function sanitizeInput(raw: string): string {
  if (!raw || typeof raw !== "string") throw new Error("Input must be a non-empty string");
  if (raw.length > 4000) throw new Error("Input too long");
  
  let sanitized = raw;
  for (const pattern of INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, "[FILTERED]");
  }
  return sanitized.trim();
}

function validateUserInput(input: string): string {
  return sanitizeInput(input);
}
