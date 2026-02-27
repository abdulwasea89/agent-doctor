const maxInputLen = 4000;

function processUserInput(input: string): string {
  if (input.length > maxInputLen) {
    throw new Error(`Input too long: ${input.length} chars (max ${maxInputLen})`);
  }
  return input.trim();
}
