async function someApiCall() { return Promise.resolve(); }
async function process() {
  await someApiCall();
}
