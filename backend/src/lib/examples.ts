/**
 * Apex Encryption - Live Examples
 * Complete end-to-end example showing how to use the vault in Haven
 */

import ApexVault, { DecryptionContext } from './ApexVault';
import VaultService from '../services/VaultService';

// ============================================================================
// EXAMPLE 1: Basic Encryption/Decryption
// ============================================================================

export async function exampleBasicEncryption() {
  console.log('\n=== EXAMPLE 1: Basic Encryption/Decryption ===\n');

  const vault = new ApexVault();
  const masterKey = 'my-secure-master-key-must-be-strong';

  // Sample sensitive data (from a citizen)
  const sensitiveData = JSON.stringify({
    fullName: 'John Doe',
    socialSecurityNumber: '123-45-6789',
    monthlyIncome: 3500,
    dependents: 2,
    address: '123 Main Street, San Jose, CA 95110',
    medicalHistory: 'Type 2 Diabetes, Controlled Hypertension',
  });

  console.log('📝 Original Data:');
  console.log(sensitiveData);
  console.log();

  // Encrypt
  console.log('🔐 Encrypting...');
  const encryptResult = await vault.protect(sensitiveData, masterKey);

  if (!encryptResult.success) {
    console.error('❌ Encryption failed:', encryptResult.error);
    return;
  }

  console.log('✅ Encrypted successfully');
  console.log(`   Ciphertext size: ${encryptResult.data!.ciphertext.length} bytes`);
  console.log(`   IV: ${encryptResult.data!.iv.toString('hex').substring(0, 24)}...`);
  console.log();

  // Decrypt
  console.log('🔓 Decrypting...');
  const decryptContext: DecryptionContext = {
    ciphertext: encryptResult.data!.ciphertext,
    iv: encryptResult.data!.iv,
    authTag: encryptResult.data!.authTag,
    wrappedDek: encryptResult.data!.wrappedDek,
    salt: encryptResult.data!.salt,
    version: encryptResult.data!.version,
  };

  const decryptResult = await vault.reveal(decryptContext, masterKey);

  if (!decryptResult.success) {
    console.error('❌ Decryption failed:', decryptResult.error);
    return;
  }

  console.log('✅ Decrypted successfully');
  console.log('📝 Decrypted Data:');
  console.log(decryptResult.data);
  console.log();

  // Verify it matches original
  if (decryptResult.data === sensitiveData) {
    console.log('✅ DATA INTEGRITY VERIFIED - Plaintext matches original');
  } else {
    console.log('❌ DATA MISMATCH - Something is wrong!');
  }
}

// ============================================================================
// EXAMPLE 2: Security - Wrong Key Fails
// ============================================================================

export async function exampleSecurityWrongKey() {
  console.log('\n=== EXAMPLE 2: Security Test - Wrong Key ===\n');

  const vault = new ApexVault();
  const masterKey = 'correct-master-key';
  const wrongKey = 'incorrect-master-key';

  const sensitiveData = JSON.stringify({ income: 50000, status: 'APPROVED' });

  // Encrypt with correct key
  const encryptResult = await vault.protect(sensitiveData, masterKey);

  if (!encryptResult.success) {
    console.error('Encryption failed');
    return;
  }

  // Try to decrypt with WRONG key
  console.log('🔓 Attempting decryption with WRONG key...');

  const decryptContext: DecryptionContext = {
    ciphertext: encryptResult.data!.ciphertext,
    iv: encryptResult.data!.iv,
    authTag: encryptResult.data!.authTag,
    wrappedDek: encryptResult.data!.wrappedDek,
    salt: encryptResult.data!.salt,
    version: encryptResult.data!.version,
  };

  const decryptResult = await vault.reveal(decryptContext, wrongKey);

  if (!decryptResult.success) {
    console.log('❌ Decryption FAILED (as expected)');
    console.log(`   Error: ${decryptResult.error}`);
    console.log('   ✅ SECURITY CHECK PASSED - System correctly rejected wrong key');
  } else {
    console.log('❌ SECURITY FAILURE - Wrong key should not work!');
  }
}

// ============================================================================
// EXAMPLE 3: Tamper Detection
// ============================================================================

export async function exampleSecurityTamperDetection() {
  console.log('\n=== EXAMPLE 3: Security Test - Tamper Detection ===\n');

  const vault = new ApexVault();
  const masterKey = 'my-secure-master-key';

  const sensitiveData = JSON.stringify({ amount: 5000, approved: true });

  // Encrypt
  const encryptResult = await vault.protect(sensitiveData, masterKey);

  if (!encryptResult.success) {
    console.error('Encryption failed');
    return;
  }

  console.log('🔓 Testing tamper detection...');
  console.log('   Simulating database corruption by flipping ciphertext bits...');

  // Tamper with ciphertext
  const tampered = Buffer.from(encryptResult.data!.ciphertext);
  tampered[0] ^= 0xFF; // Flip all bits in first byte

  const decryptContext: DecryptionContext = {
    ciphertext: tampered,
    iv: encryptResult.data!.iv,
    authTag: encryptResult.data!.authTag,
    wrappedDek: encryptResult.data!.wrappedDek,
    salt: encryptResult.data!.salt,
    version: encryptResult.data!.version,
  };

  const decryptResult = await vault.reveal(decryptContext, masterKey);

  if (!decryptResult.success) {
    console.log('❌ Decryption FAILED (as expected)');
    console.log(`   Error: ${decryptResult.error}`);
    console.log('   ✅ TAMPER DETECTION PASSED - System detected corruption');
  } else {
    console.log('❌ SECURITY FAILURE - Tamper detection failed!');
  }
}

// ============================================================================
// EXAMPLE 4: Production Service Usage
// ============================================================================

export async function exampleProductionService() {
  console.log('\n=== EXAMPLE 4: Production Service Usage ===\n');

  const masterKey = process.env.VAULT_MASTER_KEY || 'development-key-only';
  const vaultService = new VaultService(masterKey);

  try {
    // Scenario: Store citizen's sensitive application data
    const citizenData = JSON.stringify({
      fullName: 'Alice Johnson',
      dateOfBirth: '1990-05-15',
      ssn: '987-65-4321',
      householdIncome: 48000,
      dependents: 3,
      medicalNeeds: 'Wheelchair accessibility required',
    });

    console.log('📊 Encrypting citizen data for storage...');
    const storeResult = await vaultService.encryptAndStore(
      citizenData,
      'CITIZEN_APPLICATION',
      'user_123'
    );

    if (!storeResult.success) {
      console.error('Failed to store:', storeResult.error);
      return;
    }

    console.log('✅ Data stored with ID:', storeResult.data!.id);
    console.log('   Encrypted with key version:', storeResult.data!.encryptedData.version);

    // Later: Retrieve the data
    console.log('\n🔓 Retrieving encrypted data...');
    const retrieveResult = await vaultService.retrieveAndDecrypt(storeResult.data!.id);

    if (!retrieveResult.success) {
      console.error('Failed to retrieve:', retrieveResult.error);
      return;
    }

    console.log('✅ Data retrieved and decrypted');
    console.log('📊 Decrypted data:', retrieveResult.data);

    // Get encryption statistics
    console.log('\n📈 Encryption Statistics:');
    const stats = await vaultService.getEncryptionStats();
    console.log('   Total encrypted records:', stats.totalEncryptedRecords);
    console.log('   By resource type:', stats.byResourceType);

    await vaultService.disconnect();
  } catch (err) {
    console.error('Service error:', err);
  }
}

// ============================================================================
// EXAMPLE 5: Key Rotation Flow
// ============================================================================

export async function exampleKeyRotationConcept() {
  console.log('\n=== EXAMPLE 5: Key Rotation Flow (Conceptual) ===\n');

  console.log('🔄 Zero-Downtime Key Rotation Process:\n');

  console.log('Step 1: Background rotation starts');
  console.log('        ├─ New key version created (v2)');
  console.log('        ├─ Mark current key as DEPRECATED (v1)');
  console.log('        └─ New key marked as ACTIVE\n');

  console.log('Step 2: Batch re-encryption begins (async, non-blocking)');
  console.log('        ├─ Fetch encrypted records (batches of 100)');
  console.log('        ├─ Decrypt with OLD master key');
  console.log('        ├─ Re-encrypt with NEW master key');
  console.log('        └─ Store in database atomically\n');

  console.log('Step 3: Production traffic continues (NO DOWNTIME)');
  console.log('        ├─ New encryptions use NEW key (v2)');
  console.log('        ├─ Old records decrypt with OLD key (v1)');
  console.log('        └─ System handles multiple versions transparently\n');

  console.log('Step 4: Rotation completes');
  console.log('        ├─ Verify random sample of re-encrypted records');
  console.log('        ├─ Spot-check: Can decrypt with new key?');
  console.log('        └─ Old key moved to ARCHIVED status\n');

  console.log('⏱️  Total time: 5-15 minutes (depending on record count)');
  console.log('🌐 Downtime: ZERO');
  console.log('✅ Result: All data now encrypted with new key version\n');
}

// ============================================================================
// EXAMPLE 6: Audit Trail Integration
// ============================================================================

export async function exampleAuditTrail() {
  console.log('\n=== EXAMPLE 6: Audit Trail & Compliance ===\n');

  console.log('🔒 Every operation generates an audit log entry:\n');

  console.log('Encryption Event:');
  console.log('  ├─ timestamp: 2026-05-12T10:30:45.123Z');
  console.log('  ├─ event: ENCRYPTION_SUCCESS');
  console.log('  ├─ component: ApexVault');
  console.log('  ├─ resourceType: SENSITIVE_PII');
  console.log('  ├─ payloadSize: 256 bytes');
  console.log('  ├─ keyVersion: 1');
  console.log('  └─ duration: 8ms\n');

  console.log('Decryption Event:');
  console.log('  ├─ timestamp: 2026-05-12T10:31:22.456Z');
  console.log('  ├─ event: DECRYPTION_SUCCESS');
  console.log('  ├─ resourceType: SENSITIVE_PII');
  console.log('  ├─ userId: caseworker_789');
  console.log('  ├─ clientIp: 192.168.1.100');
  console.log('  └─ duration: 5ms\n');

  console.log('Failed Decryption (Integrity Check):');
  console.log('  ├─ timestamp: 2026-05-12T10:32:11.789Z');
  console.log('  ├─ event: INTEGRITY_CHECK_FAILED');
  console.log('  ├─ error: AUTH_TAG_MISMATCH');
  console.log('  ├─ severity: CRITICAL');
  console.log('  └─ action: Alert security team\n');

  console.log('📊 Compliance Reports Generated:');
  console.log('  ├─ Access Log: Who accessed what data, when');
  console.log('  ├─ Integrity Report: All encryption/decryption operations');
  console.log('  ├─ Key Rotation Log: Version changes and re-encryption');
  console.log('  └─ Security Alerts: Failed attempts and anomalies\n');
}

// ============================================================================
// MAIN: Run All Examples
// ============================================================================

export async function runAllExamples() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║         Apex Encryption - Live Examples                       ║');
  console.log('║     Government-Grade Vault for Haven                     ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');

  try {
    await exampleBasicEncryption();
    await exampleSecurityWrongKey();
    await exampleSecurityTamperDetection();
    // Note: exampleProductionService requires database setup
    // await exampleProductionService();
    await exampleKeyRotationConcept();
    await exampleAuditTrail();

    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                    ✅ ALL EXAMPLES COMPLETE                    ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
  } catch (err) {
    console.error('Error running examples:', err);
  }
}

export default { runAllExamples };
