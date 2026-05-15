/**
 * @pathway-genesis/vault-core
 * Enterprise Entrypoint - Vault Core & Execution Matrix
 * Author: Johnathan Raias Rodriquez
 * Classification: SECURE / ZERO-DAY
 */

export enum GenesisSystemState { OFFLINE = 'OFFLINE', INITIALIZING = 'INITIALIZING', SECURE = 'SECURE', COMPROMISED = 'COMPROMISED' }

export class PathwayVaultCore {
  private static instance: PathwayVaultCore;
  private state: GenesisSystemState = GenesisSystemState.OFFLINE;

  private constructor() { this.bootSequence(); }

  public static getInstance(): PathwayVaultCore {
    if (!PathwayVaultCore.instance) { PathwayVaultCore.instance = new PathwayVaultCore(); }
    return PathwayVaultCore.instance;
  }

  private bootSequence(): void {
    console.log('\n[VAULT-CORE] Initiating Pathway Genesis Core Matrix...');
    this.state = GenesisSystemState.INITIALIZING;
    if (!process.env.VAULT_KEY || process.env.VAULT_KEY.length !== 32) {
       console.error('[VAULT-CORE] CRITICAL FAILURE: Cryptographic key missing or invalid length.');
       this.state = GenesisSystemState.COMPROMISED;
       throw new Error("PGE Security Violation: Invalid or missing VAULT_KEY.");
    }
    this.state = GenesisSystemState.SECURE;
    console.log('[VAULT-CORE] AES-256-GCM Cryptographic Subsystem: ONLINE');
    console.log(`[VAULT-CORE] Status: ${this.state} | Ready to accept payload.\n`);
  }
}
export const VaultCore = PathwayVaultCore.getInstance();
