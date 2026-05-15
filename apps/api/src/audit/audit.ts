import { logger } from '../lib/logger';

export function audit(event: string, data: Record<string, unknown>) {
  logger.info({
    type: 'audit',
    event,
    data,
    timestamp: new Date().toISOString()
  });
}
