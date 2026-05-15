export class VaultSecretProvider {
  async getSecret(key: string): Promise<string> {
    const value = process.env[key];
    if (!value) throw new Error(`PGE-FATAL: Secret ${key} not found.`);
    if (key === 'VAULT_KEY' && value.length !== 64) {
      throw new Error("PGE-SECURITY: VAULT_KEY must be a 64-character hex string.");
    }
    return value;
  }
}