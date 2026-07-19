import { PrismaClient } from '@prisma/client';
import { TokenPayload, verifyToken, extractToken } from './auth';

export const prisma = new PrismaClient();

export interface Context {
  prisma: PrismaClient;
  user: TokenPayload | null;
}

export const createContext = ({ req, res }: any): Context => {
  const token = extractToken(req.headers.authorization);
  let user: TokenPayload | null = null;

  if (token) {
    user = verifyToken(token);
  }

  return {
    prisma,
    user,
  };
};
