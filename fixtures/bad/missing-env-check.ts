const apiKey = process.env.OPENAI_API_KEY;

async function callAPI(userMessage: string): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({ messages: [{ role: "user", content: userMessage }] }),
  });
  return response.text();
}
