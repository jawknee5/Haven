import type { DbClient } from '@haven/db';
import { db } from '../db/client';

export interface TrpcContext {
  db: DbClient;
  userId: string | null;
}

export async function createContext(opts?: { userId?: string | null }): Promise<TrpcContext> {
  return { db, userId: opts?.userId ?? null };
}
