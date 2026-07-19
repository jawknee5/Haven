type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface ReliabilityPolicy {
  timeoutMs: number;
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitterRatio: number;
  maxConcurrent: number;
  circuitFailureThreshold: number;
  circuitHalfOpenAfterMs: number;
  circuitSuccessThreshold: number;
  retryOn?: (error: unknown) => boolean;
  fallback?: <T>(error: unknown) => Promise<T> | T;
}

export interface ReliabilityTelemetry {
  operation: string;
  state: CircuitState;
  inFlight: number;
  successes: number;
  failures: number;
  retries: number;
  timeouts: number;
  circuitOpenRejects: number;
  lastLatencyMs: number;
  avgLatencyMs: number;
  lastError?: string;
  lastUpdatedAt?: string;
}

interface CircuitTracker {
  state: CircuitState;
  failures: number;
  successes: number;
  openedAt?: number;
  inFlight: number;
}

interface MetricTracker {
  successes: number;
  failures: number;
  retries: number;
  timeouts: number;
  circuitOpenRejects: number;
  totalLatencyMs: number;
  lastLatencyMs: number;
  lastError?: string;
  lastUpdatedAt?: number;
}

const DEFAULT_POLICY: ReliabilityPolicy = {
  timeoutMs: 15000,
  maxRetries: 2,
  baseDelayMs: 250,
  maxDelayMs: 5000,
  jitterRatio: 0.25,
  maxConcurrent: 25,
  circuitFailureThreshold: 5,
  circuitHalfOpenAfterMs: 20000,
  circuitSuccessThreshold: 2,
};

export class ReliabilityEngine {
  private static instance: ReliabilityEngine;
  private circuits = new Map<string, CircuitTracker>();
  private metrics = new Map<string, MetricTracker>();

  static getInstance(): ReliabilityEngine {
    if (!this.instance) {
      this.instance = new ReliabilityEngine();
    }
    return this.instance;
  }

  async execute<T>(
    operation: string,
    task: () => Promise<T>,
    policyOverride?: Partial<ReliabilityPolicy>
  ): Promise<T> {
    const policy: ReliabilityPolicy = { ...DEFAULT_POLICY, ...policyOverride };
    const circuit = this.getCircuit(operation);
    const metric = this.getMetric(operation);

    this.promoteHalfOpenIfCooldownElapsed(circuit, policy);

    if (circuit.state === 'OPEN') {
      metric.circuitOpenRejects += 1;
      metric.lastError = 'Circuit is OPEN';
      metric.lastUpdatedAt = Date.now();
      return this.withFallbackOrThrow(operation, new Error(`[Reliability] ${operation} rejected: circuit OPEN`), policy);
    }

    if (circuit.inFlight >= policy.maxConcurrent) {
      const err = new Error(`[Reliability] ${operation} rejected: bulkhead limit reached (${policy.maxConcurrent})`);
      metric.failures += 1;
      metric.lastError = err.message;
      metric.lastUpdatedAt = Date.now();
      return this.withFallbackOrThrow(operation, err, policy);
    }

    circuit.inFlight += 1;
    try {
      let attempt = 0;
      let lastError: unknown;

      while (attempt <= policy.maxRetries) {
        const startedAt = Date.now();
        try {
          const result = await this.withTimeout(task(), policy.timeoutMs, operation);
          const latency = Date.now() - startedAt;
          this.recordSuccess(circuit, metric, latency, policy);
          return result;
        } catch (error) {
          const latency = Date.now() - startedAt;
          lastError = error;
          this.recordFailure(circuit, metric, error, latency, policy);

          if (attempt >= policy.maxRetries || !this.shouldRetry(error, policy)) {
            break;
          }

          metric.retries += 1;
          const delay = this.backoffDelay(attempt, policy);
          await this.sleep(delay);
          attempt += 1;
        }
      }

      return this.withFallbackOrThrow(operation, lastError, policy);
    } finally {
      circuit.inFlight = Math.max(0, circuit.inFlight - 1);
    }
  }

  getTelemetry(): ReliabilityTelemetry[] {
    const operations = new Set([...this.circuits.keys(), ...this.metrics.keys()]);
    return Array.from(operations).map((op) => {
      const circuit = this.getCircuit(op);
      const metric = this.getMetric(op);
      const attempts = metric.successes + metric.failures;
      const avgLatencyMs = attempts > 0 ? Math.round(metric.totalLatencyMs / attempts) : 0;
      return {
        operation: op,
        state: circuit.state,
        inFlight: circuit.inFlight,
        successes: metric.successes,
        failures: metric.failures,
        retries: metric.retries,
        timeouts: metric.timeouts,
        circuitOpenRejects: metric.circuitOpenRejects,
        lastLatencyMs: metric.lastLatencyMs,
        avgLatencyMs,
        lastError: metric.lastError,
        lastUpdatedAt: metric.lastUpdatedAt ? new Date(metric.lastUpdatedAt).toISOString() : undefined,
      };
    });
  }

  getOperationNames(): string[] {
    const operations = new Set([...this.circuits.keys(), ...this.metrics.keys()]);
    return Array.from(operations).sort();
  }

  resetOperation(operation: string, clearMetrics = false): boolean {
    if (!this.circuits.has(operation) && !this.metrics.has(operation)) {
      return false;
    }

    const circuit = this.getCircuit(operation);
    circuit.state = 'CLOSED';
    circuit.failures = 0;
    circuit.successes = 0;
    circuit.openedAt = undefined;
    circuit.inFlight = 0;

    const metric = this.getMetric(operation);
    metric.lastError = undefined;
    metric.lastUpdatedAt = Date.now();

    if (clearMetrics) {
      metric.successes = 0;
      metric.failures = 0;
      metric.retries = 0;
      metric.timeouts = 0;
      metric.circuitOpenRejects = 0;
      metric.totalLatencyMs = 0;
      metric.lastLatencyMs = 0;
    }

    return true;
  }

  resetAll(clearMetrics = false): { resetCount: number; operations: string[] } {
    const operations = this.getOperationNames();
    for (const op of operations) {
      this.resetOperation(op, clearMetrics);
    }
    return {
      resetCount: operations.length,
      operations,
    };
  }

  private getCircuit(operation: string): CircuitTracker {
    const existing = this.circuits.get(operation);
    if (existing) return existing;
    const created: CircuitTracker = {
      state: 'CLOSED',
      failures: 0,
      successes: 0,
      inFlight: 0,
    };
    this.circuits.set(operation, created);
    return created;
  }

  private getMetric(operation: string): MetricTracker {
    const existing = this.metrics.get(operation);
    if (existing) return existing;
    const created: MetricTracker = {
      successes: 0,
      failures: 0,
      retries: 0,
      timeouts: 0,
      circuitOpenRejects: 0,
      totalLatencyMs: 0,
      lastLatencyMs: 0,
    };
    this.metrics.set(operation, created);
    return created;
  }

  private promoteHalfOpenIfCooldownElapsed(circuit: CircuitTracker, policy: ReliabilityPolicy) {
    if (circuit.state !== 'OPEN' || !circuit.openedAt) return;
    if (Date.now() - circuit.openedAt >= policy.circuitHalfOpenAfterMs) {
      circuit.state = 'HALF_OPEN';
      circuit.successes = 0;
      circuit.failures = 0;
    }
  }

  private recordSuccess(
    circuit: CircuitTracker,
    metric: MetricTracker,
    latency: number,
    policy: ReliabilityPolicy
  ) {
    metric.successes += 1;
    metric.lastLatencyMs = latency;
    metric.totalLatencyMs += latency;
    metric.lastUpdatedAt = Date.now();

    if (circuit.state === 'HALF_OPEN') {
      circuit.successes += 1;
      if (circuit.successes >= policy.circuitSuccessThreshold) {
        circuit.state = 'CLOSED';
        circuit.failures = 0;
        circuit.successes = 0;
        circuit.openedAt = undefined;
      }
      return;
    }

    circuit.failures = 0;
  }

  private recordFailure(
    circuit: CircuitTracker,
    metric: MetricTracker,
    error: unknown,
    latency: number,
    policy: ReliabilityPolicy
  ) {
    metric.failures += 1;
    metric.lastLatencyMs = latency;
    metric.totalLatencyMs += latency;
    metric.lastError = this.errorToString(error);
    metric.lastUpdatedAt = Date.now();

    if (this.isTimeoutError(error)) {
      metric.timeouts += 1;
    }

    if (circuit.state === 'HALF_OPEN') {
      circuit.state = 'OPEN';
      circuit.openedAt = Date.now();
      circuit.failures = 0;
      circuit.successes = 0;
      return;
    }

    circuit.failures += 1;
    if (circuit.failures >= policy.circuitFailureThreshold) {
      circuit.state = 'OPEN';
      circuit.openedAt = Date.now();
      circuit.failures = 0;
      circuit.successes = 0;
    }
  }

  private shouldRetry(error: unknown, policy: ReliabilityPolicy): boolean {
    if (policy.retryOn) return policy.retryOn(error);
    return this.isTransientError(error);
  }

  private isTransientError(error: unknown): boolean {
    const err = error as any;
    const code = err?.code;
    const status = err?.response?.status;
    if (code && ['ECONNRESET', 'ECONNABORTED', 'ETIMEDOUT', 'EAI_AGAIN', 'ENOTFOUND'].includes(code)) {
      return true;
    }
    if (typeof status === 'number' && status >= 500) {
      return true;
    }
    return this.isTimeoutError(error);
  }

  private isTimeoutError(error: unknown): boolean {
    const err = error as any;
    return err?.code === 'ETIMEDOUT' || err?.code === 'ECONNABORTED' || /timeout/i.test(String(err?.message || ''));
  }

  private backoffDelay(attempt: number, policy: ReliabilityPolicy): number {
    const raw = Math.min(policy.maxDelayMs, policy.baseDelayMs * 2 ** attempt);
    const jitter = raw * policy.jitterRatio * (Math.random() * 2 - 1);
    return Math.max(0, Math.round(raw + jitter));
  }

  private async withFallbackOrThrow<T>(
    operation: string,
    error: unknown,
    policy: ReliabilityPolicy
  ): Promise<T> {
    if (policy.fallback) {
      return policy.fallback<T>(error);
    }
    throw new Error(`[Reliability] ${operation} failed: ${this.errorToString(error)}`);
  }

  private withTimeout<T>(promise: Promise<T>, timeoutMs: number, operation: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        const timeoutErr = new Error(`[Reliability] ${operation} timed out after ${timeoutMs}ms`);
        (timeoutErr as any).code = 'ETIMEDOUT';
        reject(timeoutErr);
      }, timeoutMs);

      promise
        .then((value) => {
          clearTimeout(timer);
          resolve(value);
        })
        .catch((err) => {
          clearTimeout(timer);
          reject(err);
        });
    });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private errorToString(error: unknown): string {
    if (error instanceof Error) return error.message;
    return String(error);
  }
}

export const reliabilityEngine = ReliabilityEngine.getInstance();