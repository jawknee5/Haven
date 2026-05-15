import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { processTriageRequest } from './triageProcessor.ts';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

export const triageQueue = new Queue('triage-queue', { connection });

export const startTriageWorker = () => {
  new Worker('triage-queue', async (job) => {
    await processTriageRequest(job.data.caseId);
  }, { connection });
  console.log("[HTCRM] Triage Worker Online.");
};