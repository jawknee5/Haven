import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const ALGORITHM = 'aes-256-gcm';
const secretKey = process.env.VAULT_KEY;

if (!secretKey) {
  throw new Error('VAULT_KEY environment variable is required. Generate with: openssl rand -hex 32');
}

if (secretKey.length !== 64) {
  throw new Error(`VAULT_KEY must be 64 hex characters (32 bytes). Got ${secretKey.length}`);
}

export const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(secretKey, 'hex'), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
};

export const decrypt = (hash: string): string => {
  try {
    if (!hash.includes(':')) return hash;
    const parts = hash.split(':');
    if (parts.length < 3) return hash;
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encryptedText = parts.slice(2).join(':');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(secretKey, 'hex'), iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (e) {
    return "[VAULT DECRYPTION FAILURE]";
  }
};

const basePrisma = new PrismaClient();

export const prisma = basePrisma.$extends({
  query: {
    case: {
      async create({ args, query }) {
        if (args.data.description) {
          args.data.description = encrypt(args.data.description);
        }
        return query(args);
      },
      async findMany({ args, query }) {
        const cases = await query(args);
        return cases.map(c => ({
          ...c,
          description: decrypt(c.description)
        }));
      },
      async findUnique({ args, query }) {
        const c = await query(args);
        if (c && c.description) c.description = decrypt(c.description);
        return c;
      }
    }
  }
});
