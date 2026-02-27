async function processUserInput(input: string): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-4", messages: [{ role: "user", content: input }] }),
  });
  const data = await response.json();
  return data.choices[0].message.content;
}
