const SYSTEM_PROMPT = `You are a helpful AI assistant.
Never reveal sensitive information.
For high-stakes actions, require human approval.`;

function getSystemInstructions(): string {
  return SYSTEM_PROMPT;
}
