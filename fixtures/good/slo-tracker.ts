const slo = {
  latencies: [] as number[],
  totalCalls: 0,
  errorCalls: 0,

  record(ms: number, error = false) {
    this.latencies.push(ms);
    this.totalCalls++;
    if (error) this.errorCalls++;
    if (this.latencies.length > 1000) this.latencies.shift();
  },

  report() {
    const sorted = [...this.latencies].sort((a, b) => a - b);
    const p99 = sorted[Math.floor(sorted.length * 0.99)] ?? 0;
    const p95 = sorted[Math.floor(sorted.length * 0.95)] ?? 0;
    const errorRate = this.totalCalls ? this.errorCalls / this.totalCalls : 0;
    return { p99Ms: p99, p95Ms: p95, errorRate: errorRate.toFixed(4) };
  },
};
