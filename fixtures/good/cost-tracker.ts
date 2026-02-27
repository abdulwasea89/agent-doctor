const costTracker = {
  totalTokensUsed: 0,
  totalRequests: 0,

  track(tokens: number, traceId: string) {
    this.totalTokensUsed += tokens;
    this.totalRequests++;
    console.log(`[Cost] traceId=${traceId} tokens=${tokens} total=${this.totalTokensUsed}`);
  },

  report() {
    const estimatedUSD = ((this.totalTokensUsed / 1000) * 0.005).toFixed(4);
    return { totalTokensUsed: this.totalTokensUsed, totalRequests: this.totalRequests, estimatedUSD };
  },
};
