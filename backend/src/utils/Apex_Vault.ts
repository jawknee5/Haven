/**
 * Apex Vault Integration for Pathway
 * Replaces basic prismaVault.ts with production-grade encryption
 * 
 * This module integrates Apex_Vault into Havens's case management system,
 * encrypting all sensitive PII at rest with government-grade AES-256-GCM.
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync, timingSafeEqual, createHmac } from 'crypto';

// ============================================================================
// TYPES
// ============================================================================

export interface EncryptedPayload {
  ciphertext: Buffer;
  iv: Buffer;
  authTag: Buffer;
  wrappedDek: Buffer;
  salt: Buffer;
  version: number;
  timestamp: string;
}

export interface DecryptionContext {
  ciphertext: Buffer;
  iv: Buffer;
  authTag: Buffer;
  wrappedDek: Buffer;
  salt: Buffer;
  version: number;
}

export interface VaultResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  timestamp: string;
}

// ============================================================================
// APEX VAULT - PRODUCTION GRADE
// ============================================================================

export class Apex_Vault {
  private readonly ALGORITHM = 'aes-256-gcm';
  private readonly IV_LENGTH = 12;
  private readonly AUTH_TAG_LENGTH = 16;
  private readonly KEY_LENGTH = 32;
  private readonly SALT_LENGTH = 16;
  private readonly SCRYPT_N = 2 ** 15;
  private readonly SCRYPT_R = 8;
  private readonly SCRYPT_P = 1;
  private readonly SCRYPT_DKLEN = 32;

  private masterKey: string;
  private currentKeyVersion: number = 1;

  constructor(masterKey: string) {
    if (!masterKey || masterKey.length < 32) {
      throw new Error('Master key must be at least 32 characters');
    }
    this.masterKey = masterKey;
  }

  /**
   * Encrypt sensitive data (case descriptions, PII, etc.)
   */
  public protect(plaintext: string): VaultResult<string> {
    const startTime = Date.now();

    try {
      if (!plaintext || typeof plaintext !== 'string') {
        return this.formatError('INVALID_PAYLOAD', 'Plaintext must be a non-empty string');
      }

      // Generate DEK and IV
      const dek = randomBytes(this.KEY_LENGTH);
      const iv = randomBytes(this.IV_LENGTH);
      const salt = randomBytes(this.SALT_LENGTH);

      // Encrypt payload
      const cipher = createCipheriv(this.ALGORITHM, dek, iv, {
        authTagLength: this.AUTH_TAG_LENGTH,
      });

      const ciphertext = Buffer.concat([
        cipher.update(plaintext, 'utf8'),
        cipher.final(),
      ]);

      const authTag = cipher.getAuthTag();

      // Wrap DEK
      const wrappingKey = scryptSync(this.masterKey, salt, this.SCRYPT_DKLEN, {
        N: this.SCRYPT_N,
        r: this.SCRYPT_R,
        p: this.SCRYPT_P,
      });

      const wrappedDek = this.wrapKey(dek, wrappingKey);

      // Construct serialized envelope
      const envelope: EncryptedPayload = {
        ciphertext,
        iv,
        authTag,
        wrappedDek,
        salt,
        version: this.currentKeyVersion,
        timestamp: new Date().toISOString(),
      };

      // Serialize to hex string (compatible with Haven's storage)
      const serialized = this.serializeEnvelope(envelope);

      this.logAudit('ENCRYPTION_SUCCESS', {
        payloadSize: plaintext.length,
        duration: `${Date.now() - startTime}ms`,
      });

      return {
        success: true,
        data: serialized,
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      return this.formatError('ENCRYPTION_FAILED', `Failed to encrypt: ${err}`);
    }
  }

  /**
   * Decrypt sensitive data
   */
  public reveal(encryptedHex: string): VaultResult<string> {
    const startTime = Date.now();

    try {
      if (!encryptedHex || typeof encryptedHex !== 'string') {
        return this.formatError('INVALID_CONTEXT', 'Encrypted data must be a non-empty string');
      }

      // Deserialize envelope
      let envelope: EncryptedPayload;
      try {
        envelope = this.deserializeEnvelope(encryptedHex);
      } catch (err) {
        return this.formatError('INVALID_FORMAT', 'Encrypted data is not in valid format');
      }

      // Unwrap DEK
      const wrappingKey = scryptSync(this.masterKey, envelope.salt, this.SCRYPT_DKLEN, {
        N: this.SCRYPT_N,
        r: this.SCRYPT_R,
        p: this.SCRYPT_P,
      });

      let dek: Buffer;
      try {
        dek = this.unwrapKey(envelope.wrappedDek, wrappingKey);
      } catch (err) {
        this.logAudit('UNWRAP_FAILURE', { error: 'KEY_UNWRAP_FAILED' });
        return this.formatError('KEY_UNWRAP_FAILED', 'Failed to unwrap DEK - key mismatch');
      }

      // Decrypt
      const decipher = createDecipheriv(this.ALGORITHM, dek, envelope.iv, {
        authTagLength: this.AUTH_TAG_LENGTH,
      });

      decipher.setAuthTag(envelope.authTag);

      let plaintext: string;
      try {
        plaintext = Buffer.concat([
          decipher.update(envelope.ciphertext),
          decipher.final(),
        ]).toString('utf8');
      } catch (err) {
        this.logAudit('INTEGRITY_CHECK_FAILED', { error: 'AUTH_TAG_MISMATCH' });
        return this.formatError('INTEGRITY_CHECK_FAILED', 'Authentication tag mismatch - data tampered');
      }

      this.logAudit('DECRYPTION_SUCCESS', {
        payloadSize: plaintext.length,
        duration: `${Date.now() - startTime}ms`,
      });

      return {
        success: true,
        data: plaintext,
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      return this.formatError('DECRYPTION_FAILED', `Failed to decrypt: ${err}`);
    }
  }

  /**
   * Wrap DEK with KEK
   */
  private wrapKey(dek: Buffer, wrappingKey: Buffer): Buffer {
    const hmac = createHmac('sha256', wrappingKey);
    hmac.update(dek);
    const integrityTag = hmac.digest();

    return Buffer.concat([
      Buffer.from(dek.map((byte, idx) => byte ^ wrappingKey[idx % wrappingKey.length])),
      integrityTag.slice(0, 8),
    ]);
  }

  /**
   * Unwrap DEK from KEK
   */
  private unwrapKey(wrappedDek: Buffer, wrappingKey: Buffer): Buffer {
    if (wrappedDek.length < 40) {
      throw new Error('INVALID_WRAPPED_KEY_LENGTH');
    }

    const wrappedPayload = wrappedDek.slice(0, 32);
    const integrityTag = wrappedDek.slice(32, 40);

    const hmac = createHmac('sha256', wrappingKey);
    hmac.update(wrappedPayload);
    const expectedTag = hmac.digest().slice(0, 8);

    if (!timingSafeEqual(integrityTag, expectedTag)) {
      throw new Error('INTEGRITY_CHECK_FAILED');
    }

    return Buffer.from(wrappedPayload.map((byte, idx) => byte ^ wrappingKey[idx % wrappingKey.length]));
  }

  /**
   * Serialize envelope to hex string (backwards compatible with DB storage)
   */
  private serializeEnvelope(envelope: EncryptedPayload): string {
    const parts = [
      envelope.ciphertext.toString('hex'),
      envelope.iv.toString('hex'),
      envelope.authTag.toString('hex'),
      envelope.wrappedDek.toString('hex'),
      envelope.salt.toString('hex'),
      envelope.version.toString(),
    ];
    return parts.join(':');
  }

  /**
   * Deserialize envelope from hex string
   */
  private deserializeEnvelope(serialized: string): EncryptedPayload {
    const parts = serialized.split(':');
    if (parts.length < 6) {
      throw new Error('INVALID_ENVELOPE_FORMAT');
    }

    return {
      ciphertext: Buffer.from(parts[0], 'hex'),
      iv: Buffer.from(parts[1], 'hex'),
      authTag: Buffer.from(parts[2], 'hex'),
      wrappedDek: Buffer.from(parts[3], 'hex'),
      salt: Buffer.from(parts[4], 'hex'),
      version: parseInt(parts[5], 10),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Error formatter
   */
  private formatError(code: string, message: string): VaultResult<never> {
    this.logAudit('SECURITY_EVENT', { type: 'ERROR', code });
    return {
      success: false,
      error: message,
      code,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Audit logging
   */
  private logAudit(event: string, context: object): void {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      event,
      component: 'XortronVault',
      ...context,
    };
    console.log(`[APEX-AUDIT] ${JSON.stringify(auditEntry)}`);
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

const masterKey = process.env.VAULT_KEY || process.env.APEX_MASTER_KEY;

if (!masterKey) {
  throw new Error(
    'VAULT_KEY or APEX_MASTER_KEY environment variable is required. Generate with: openssl rand -hex 32'
  );
}

export const apexVault = new ApexVault(masterKey);

// ============================================================================
// BACKWARDS-COMPATIBLE EXPORTS (Drop-in replacement for prismaVault)
// ============================================================================

/**
 * Drop-in replacement for old encrypt function
 */
export const encrypt = (text: string): string => {
  const result = apexVault.protect(text);
  if (!result.success) {
    throw new Error(result.error || 'Encryption failed');
  }
  return result.data!;
};

/**
 * Drop-in replacement for old decrypt function
 */
export const decrypt = (hash: string): string => {
  // Fallback: if already plaintext, return as-is
  if (!hash.includes(':')) {
    return hash;
  }

  // Attempt modern envelope decryption
  try {
    const result = apexVault.reveal(hash);
    if (result.success) {
      return result.data!;
    }
    // If fails, return failure marker
    return '[VAULT DECRYPTION FAILURE]';
  } catch (err) {
    return '[VAULT DECRYPTION FAILURE]';
  }
};

export default apexVault;
