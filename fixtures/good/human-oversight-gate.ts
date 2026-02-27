const HIGH_STAKES_PATTERNS = [
  /transfer|send|payment|delete|drop/i,
];

function requiresHumanOversight(input: string): boolean {
  return HIGH_STAKES_PATTERNS.some((p) => p.test(input));
}

async function humanOversightGate(input: string): Promise<boolean> {
  if (!requiresHumanOversight(input)) return true;
  console.log("[HumanOversight] High-stakes action blocked pending human review");
  return false;
}
