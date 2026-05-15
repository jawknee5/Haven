/**
 * Vault Service - Production Wrapper
 * Integrates ApexVault and VaultRotator for production use
 */

import ApexVault, { DecryptionContext, EncryptedPayload, VaultResult } from '../lib/ApexVault';
import VaultRotator, { RotationStatus, RotationMetrics } from '../lib/VaultRotator';
import { prisma } from '../lib/prisma';

export class VaultService {
  private vault: ApexVault;
  private rotator: VaultRotator;
  private masterKey: string;

  constructor(masterKey: string) {
    this.masterKey = masterKey;
    this.vault = new ApexVault();
    this.rotator = new VaultRotator();
  }

  /**
   * Encrypt and store sensitive data
   */
  public async encryptAndStore(
    data: string,
    resourceType: string,
    userId?: string
  ): Promise<VaultResult<{ id: string; encryptedData: EncryptedPayload }>> {
    try {
      const encryptResult = await this.vault.protect(data, this.masterKey);

      if (!encryptResult.success || !encryptResult.data) {
        return {
          success: false,
          error: encryptResult.error,
          code: encryptResult.code,
          timestamp: new Date().toISOString(),
        };
      }

      // Store in database
      const stored = await prisma.encryptedResource.create({
        data: {
          resourceType,
          userId: userId || 'system',
          ciphertext: encryptResult.data.ciphertext,
          iv: encryptResult.data.iv,
          authTag: encryptResult.data.authTag,
          encryptedDek: encryptResult.data.wrappedDek,
          salt: encryptResult.data.salt,
          keyVersion: encryptResult.data.version,
        },
      });

      return {
        success: true,
        data: {
          id: stored.id,
          encryptedData: encryptResult.data,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      return {
        success: false,
        error: `Failed to encrypt and store: ${err}`,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Retrieve and decrypt sensitive data
   */
  public async retrieveAndDecrypt(id: string): Promise<VaultResult<string>> {
    try {
      const record = await prisma.encryptedResource.findUnique({
        where: { id },
      });

      if (!record) {
        return {
          success: false,
          error: 'Resource not found',
          code: 'NOT_FOUND',
          timestamp: new Date().toISOString(),
        };
      }

      const context: DecryptionContext = {
        ciphertext: record.ciphertext,
        iv: record.iv,
        authTag: record.authTag,
        wrappedDek: record.encryptedDek,
        salt: record.salt,
        version: record.keyVersion,
      };

      return this.vault.reveal(context, this.masterKey);
    } catch (err) {
      return {
        success: false,
        error: `Failed to retrieve and decrypt: ${err}`,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Initiate key rotation
   */
  public async initiateKeyRotation(newMasterKey: string): Promise<void> {
    await this.rotator.initiateRotation(this.masterKey, newMasterKey);
    // Update master key after rotation completes
    this.masterKey = newMasterKey;
  }

  /**
   * Get rotation status
   */
  public async getRotationStatus(): Promise<RotationStatus> {
    return this.rotator.getRotationStatus();
  }

  /**
   * Verify rotation success
   */
  public async verifyRotation(sampleSize?: number): Promise<boolean> {
    return this.rotator.verifyRotation(this.masterKey, sampleSize);
  }

  /**
   * List all encrypted resources
   */
  public async listEncryptedResources(resourceType?: string) {
    return prisma.encryptedResource.findMany({
      where: resourceType ? { resourceType } : undefined,
      select: {
        id: true,
        resourceType: true,
        userId: true,
        keyVersion: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Get encryption statistics
   */
  public async getEncryptionStats() {
    const total = await prisma.encryptedResource.count();
    const byType = await prisma.encryptedResource.groupBy({
      by: ['resourceType'],
      _count: true,
    });

    const byKeyVersion = await prisma.encryptedResource.groupBy({
      by: ['keyVersion'],
      _count: true,
    });

    return {
      totalEncryptedRecords: total,
      byResourceType: byType,
      byKeyVersion,
    };
  }

  /**
   * Cleanup
   */
  public async disconnect(): Promise<void> {
    await this.rotator.disconnect();
  }
}

export default VaultService;
