/**
 * RESOURCE ORCHESTRATOR: Circuit Breaker Pattern for External API Resilience
 * Purpose: Prevents cascading failures when external resources become unavailable.
 * Features: Automatic failover, exponential backoff, state tracking via Redis.
 */

import Redis from 'ioredis';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'resource-orchestrator.log' })
  ],
});

enum CircuitState {
  CLOSED = 'CLOSED',       // System functioning normally
  OPEN = 'OPEN',           // Failure detected; requests blocked
  HALF_OPEN = 'HALF_OPEN', // Testing recovery after cooldown
}

export interface CircuitConfig {
  failureThreshold?: number;
  cooldownPeriod?: number;
  maxBackoffTime?: number;
  halfOpenRequestLimit?: number;
}

export class ResourceOrchestrator {
  private redis: Redis;
  private readonly namespace: string = 'orchestrator:';
  private localState: Map<string, CircuitState> = new Map();
  private failureCount: Map<string, number> = new Map();
  private lastFailureTime: Map<string, number> = new Map();

  // Default configuration
  private readonly config: Required<CircuitConfig> = {
    failureThreshold: 5,
    cooldownPeriod: 30000, // 30 seconds
    maxBackoffTime: 300000, // 5 minutes
    halfOpenRequestLimit: 3,
  };

  constructor(config?: CircuitConfig) {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    
    if (config) {
      this.config = { ...this.config, ...config };
    }

    this.redis.on('error', (err) => {
      logger.error('[ORCHESTRATOR] Redis connection error', { error: err.message });
    });

    this.redis.on('connect', () => {
      logger.info('[ORCHESTRATOR] Redis connected');
    });
  }

  /**
   * Executes a task with automatic circuit protection and exponential backoff.
   */
  public async execute<T>(
    resourceName: string,
    action: () => Promise<T>,
    options?: { timeout?: number }
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    const state = await this.getCircuitState(resourceName);

    // If circuit is open, reject immediately
    if (state === CircuitState.OPEN) {
      const timeSinceFailure = Date.now() - (this.lastFailureTime.get(resourceName) || 0);
      const backoffTime = Math.min(
        this.config.cooldownPeriod * Math.pow(2, this.failureCount.get(resourceName) || 0),
        this.config.maxBackoffTime
      );

      if (timeSinceFailure < backoffTime) {
        logger.warn(`[ORCHESTRATOR] Circuit OPEN for ${resourceName}. Backoff: ${backoffTime}ms`, {
          resourceName,
          timeElapsed: timeSinceFailure,
          requiredBackoff: backoffTime,
        });
        return {
          success: false,
          error: `Service unavailable (cooling down). Retry after ${Math.ceil(backoffTime / 1000)}s`,
        };
      }

      // Attempt to transition to HALF_OPEN
      await this.setCircuitState(resourceName, CircuitState.HALF_OPEN);
    }

    // Execute the action with timeout protection
    try {
      const result = await this.executeWithTimeout(action, options?.timeout || 10000);
      
      // Success: reset circuit
      await this.resetCircuit(resourceName);
      
      return { success: true, data: result };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Failure: record and potentially trip circuit
      await this.recordFailure(resourceName, errorMessage);

      return {
        success: false,
        error: `Request failed: ${errorMessage}`,
      };
    }
  }

  /**
   * Execute action with timeout protection.
   */
  private executeWithTimeout<T>(action: () => Promise<T>, timeout: number): Promise<T> {
    return Promise.race([
      action(),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Operation timeout after ${timeout}ms`)), timeout)
      ),
    ]);
  }

  /**
   * Record failure and potentially trip the circuit.
   */
  private async recordFailure(resourceName: string, errorMessage: string): Promise<void> {
    const currentCount = (this.failureCount.get(resourceName) || 0) + 1;
    this.failureCount.set(resourceName, currentCount);
    this.lastFailureTime.set(resourceName, Date.now());

    logger.error(`[ORCHESTRATOR] Task failed for ${resourceName}`, {
      resourceName,
      failureCount: currentCount,
      threshold: this.config.failureThreshold,
      error: errorMessage,
    });

    // Store failure count in Redis for multi-instance awareness
    await this.redis.incr(`${this.namespace}failures:${resourceName}`);

    // Trip circuit if threshold exceeded
    if (currentCount >= this.config.failureThreshold) {
      await this.setCircuitState(resourceName, CircuitState.OPEN);
      logger.error(`[ORCHESTRATOR] Circuit TRIPPED for ${resourceName}`, {
        resourceName,
        failureCount: currentCount,
      });
    }
  }

  /**
   * Reset circuit on successful execution.
   */
  private async resetCircuit(resourceName: string): Promise<void> {
    this.failureCount.set(resourceName, 0);
    this.lastFailureTime.delete(resourceName);
    await this.setCircuitState(resourceName, CircuitState.CLOSED);
    await this.redis.del(`${this.namespace}failures:${resourceName}`);

    logger.info(`[ORCHESTRATOR] Circuit RESET for ${resourceName}`, { resourceName });
  }

  /**
   * Get current circuit state (from Redis for multi-instance sync).
   */
  private async getCircuitState(resourceName: string): Promise<CircuitState> {
    // Check Redis first (for multi-instance state)
    const redisState = await this.redis.get(`${this.namespace}state:${resourceName}`);
    if (redisState) {
      this.localState.set(resourceName, redisState as CircuitState);
      return redisState as CircuitState;
    }

    // Fall back to local state
    return this.localState.get(resourceName) || CircuitState.CLOSED;
  }

  /**
   * Set circuit state (persists to Redis for multi-instance sync).
   */
  private async setCircuitState(resourceName: string, state: CircuitState): Promise<void> {
    this.localState.set(resourceName, state);
    // Set with 5-minute expiry to prevent stale state
    await this.redis.setex(`${this.namespace}state:${resourceName}`, 300, state);
  }

  /**
   * Get circuit metrics for monitoring.
   */
  public async getMetrics(resourceName: string): Promise<{
    state: CircuitState;
    failureCount: number;
    lastFailureTime?: number;
  }> {
    const state = await this.getCircuitState(resourceName);
    const failureCount = this.failureCount.get(resourceName) || 0;
    const lastFailureTime = this.lastFailureTime.get(resourceName);

    return {
      state,
      failureCount,
      lastFailureTime,
    };
  }

  /**
   * Reset all circuits (emergency recovery).
   */
  public async resetAll(): Promise<void> {
    this.failureCount.clear();
    this.lastFailureTime.clear();
    this.localState.clear();
    
    // Clear Redis state
    const keys = await this.redis.keys(`${this.namespace}*`);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }

    logger.info('[ORCHESTRATOR] All circuits RESET');
  }

  /**
   * Graceful shutdown.
   */
  public async shutdown(): Promise<void> {
    await this.redis.quit();
    logger.info('[ORCHESTRATOR] Shutdown complete');
  }
}

// Singleton instance
export const orchestrator = new ResourceOrchestrator();
