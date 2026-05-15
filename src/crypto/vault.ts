import crypto from 'node:crypto';
import { VaultSecretProvider } from '../../infra/secrets/SecretProvider.ts';

const provider = new VaultSecretProvider();

export async function encrypt(text: string) {
  const key = Buffer.from(await provider.getSecret('VAULT_KEY'), 'hex');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return { 
    ciphertext: encrypted.toString('hex'), 
    iv: iv.toString('hex'), 
    tag: cipher.getAuthTag().toString('hex') 
  };
}