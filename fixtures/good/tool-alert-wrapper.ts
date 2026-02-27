function withToolAlert<T>(fn: () => Promise<T>): () => Promise<T> {
  return async () => {
    try {
      return await fn();
    } catch (err) {
      console.error("Tool failed:", err);
      throw err;
    }
  };
}
