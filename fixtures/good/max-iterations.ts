const maxIterations = 10;
let iterationCount = 0;

function runAgent(input: string): void {
  if (iterationCount >= maxIterations) {
    iterationCount = 0;
    console.log("Max iterations reached, resetting");
    return;
  }
  iterationCount++;
  console.log(`Processing: ${input}`);
}
