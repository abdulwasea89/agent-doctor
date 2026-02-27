const streamEnabled = true;

async function streamResponse(input: string) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    body: JSON.stringify({ model: "gpt-4", stream: true }),
  });
  return response.body;
}
