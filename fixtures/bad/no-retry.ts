async function makeRequest() {
  const resp = await fetch("https://api.example.com");
  return resp.text();
}
