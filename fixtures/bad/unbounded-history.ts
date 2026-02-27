const history: { role: string; content: string }[] = [];

async function chat(input: string): Promise<void> {
  history.push({ role: "user", content: input });
  const response = await fetch("https://api.openai.com/v1/chat", {
    method: "POST",
    body: JSON.stringify({ messages: history }),
  });
  const data = await response.json();
  history.push({ role: "assistant", content: data.choices[0].message.content });
}
