import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'DEVELOPMENT_SECRET_KEY_CHANGE_IN_PRODUCTION';
const JWT_EXPIRY = '24h';

// ============================================
// PASSWORD HASHING
// ============================================

export const hashPassword = (password: string): string => {
  return crypto
    .createHash('sha256')
    .update(password + process.env.VAULT_KEY)
    .digest('hex');
};

export const verifyPassword = (password: string, hash: string): boolean => {
  const computed = hashPassword(password);
  return computed === hash;
};

// ============================================
// JWT TOKEN GENERATION & VALIDATION
// ============================================

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'CITIZEN' | 'CASEWORKER' | 'ADMIN' | 'SYSTEM';
  iat?: number;
  exp?: number;
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
};

export const signToken = generateToken;

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    console.error('[AUTH] Token verification failed:', error);
    return null;
  }
};

export const extractToken = (authHeader: string | undefined): string | null => {
  if (!authHeader) return null;
  if (!authHeader.startsWith('Bearer ')) return null;
  return authHeader.substring(7);
};

// ============================================
// SESSION MANAGEMENT
// ============================================

export const createSession = async (
  prisma: any,
  userId: string,
  token: string
): Promise<void> => {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });
};

export const validateSession = async (
  prisma: any,
  token: string
): Promise<{ userId: string; valid: boolean }> => {
  const session = await prisma.session.findUnique({ where: { token } });
  
  if (!session) {
    return { userId: '', valid: false };
  }

  if (new Date() > session.expiresAt) {
    await prisma.session.delete({ where: { token } });
    return { userId: '', valid: false };
  }

  return { userId: session.userId, valid: true };
};

export const revokeSession = async (prisma: any, token: string): Promise<void> => {
  await prisma.session.delete({ where: { token } }).catch(() => {});
};
