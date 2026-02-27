async function test() {
  try {
    await someOperation();
  } catch (e) {
  }
}
function someOperation() { return Promise.resolve(); }
