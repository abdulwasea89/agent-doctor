class CircuitBreaker {
  private failures = 0;
  private state: "closed" | "open" | "half-open" = "closed";
  private lastFailureTime = 0;
  private readonly resetTimeout = 30000;

  isOpen(): boolean {
    if (this.state === "open") {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = "half-open";
        return false;
      }
      return true;
    }
    return false;
  }

  recordSuccess(): void { 
    this.failures = 0; 
    this.state = "closed"; 
  }

  recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    if (this.failures >= 5) {
      this.state = "open";
    }
  }

  getState() { return this.state; }
  getFailures() { return this.failures; }
}

const circuitBreaker = new CircuitBreaker();
