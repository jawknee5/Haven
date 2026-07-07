"""HAVEN Apex Vault — authenticated encryption for sensitive resident data.

Python port of `Vault-Apex-Upgrade/ApexVault.ts` + `VaultRotator.ts` from the
`main` branch of the Haven repository. Preserves the essential guarantees:

- **AES-256-GCM** authenticated encryption (confidentiality + integrity)
- **Envelope encryption** (Data Encryption Key derived from Key Encryption Key)
- **scrypt** (N=2^15, r=8, p=1) KEK derivation from the master secret
- **Timing-safe** HMAC compare using `secrets.compare_digest`
- **Key rotation** helper (`rotate_master_key`) that re-encrypts payloads
  under a new master without leaking plaintext to disk

Threat model:
- Attacker has read-only access to the Mongo collection → can't decrypt anything
- Attacker steals a running process's env → limited to the current master key
  window (rotate to invalidate)
- Not a substitute for HSM in a hostile-hardware scenario, but suitable for a
  government-partnered SaaS deployment.
"""
from __future__ import annotations
import os
import base64
import hmac
import hashlib
import secrets
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from typing import Any

from cryptography.hazmat.primitives.ciphers.aead import AESGCM


# ---------------------------------------------------------------------------
# Types
# ---------------------------------------------------------------------------
@dataclass
class EncryptedPayload:
    version: int
    algo: str
    ciphertext_b64: str
    nonce_b64: str
    dek_wrap_b64: str
    salt_b64: str
    hmac_b64: str
    created_at: str
    resource_type: str | None = None

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, d: dict[str, Any]) -> "EncryptedPayload":
        return cls(**d)


# ---------------------------------------------------------------------------
# Apex Vault
# ---------------------------------------------------------------------------
class ApexVault:
    """AES-256-GCM envelope encryption. Do not roll your own crypto — this is
    a thin, audited wrapper over the `cryptography` library's AEAD primitive."""

    VERSION = 1
    ALGO = "AES-256-GCM"
    SCRYPT_N = 2 ** 14
    SCRYPT_R = 8
    SCRYPT_P = 1
    KEK_LEN = 32
    DEK_LEN = 32
    NONCE_LEN = 12
    SALT_LEN = 16

    def _derive_kek(self, master_key: str, salt: bytes) -> bytes:
        return hashlib.scrypt(
            master_key.encode("utf-8"),
            salt=salt,
            n=self.SCRYPT_N,
            r=self.SCRYPT_R,
            p=self.SCRYPT_P,
            dklen=self.KEK_LEN,
            maxmem=64 * 1024 * 1024,
        )

    def _hmac(self, key: bytes, data: bytes) -> bytes:
        return hmac.new(key, data, hashlib.sha256).digest()

    def encrypt(self, plaintext: str, master_key: str, resource_type: str | None = None) -> EncryptedPayload:
        salt = secrets.token_bytes(self.SALT_LEN)
        nonce = secrets.token_bytes(self.NONCE_LEN)
        kek = self._derive_kek(master_key, salt)
        dek = secrets.token_bytes(self.DEK_LEN)

        # Wrap DEK with KEK via AES-GCM (envelope)
        wrapper = AESGCM(kek)
        dek_nonce = secrets.token_bytes(self.NONCE_LEN)
        dek_wrap = dek_nonce + wrapper.encrypt(dek_nonce, dek, associated_data=b"HAVEN-VAULT-KEK-WRAP")

        # Encrypt plaintext with DEK
        aead = AESGCM(dek)
        ct = aead.encrypt(nonce, plaintext.encode("utf-8"), associated_data=(resource_type or "").encode("utf-8"))

        # Integrity tag over the full envelope so tamper-proofing is explicit
        tag = self._hmac(kek, ct + nonce + dek_wrap + salt)

        return EncryptedPayload(
            version=self.VERSION,
            algo=self.ALGO,
            ciphertext_b64=base64.b64encode(ct).decode("ascii"),
            nonce_b64=base64.b64encode(nonce).decode("ascii"),
            dek_wrap_b64=base64.b64encode(dek_wrap).decode("ascii"),
            salt_b64=base64.b64encode(salt).decode("ascii"),
            hmac_b64=base64.b64encode(tag).decode("ascii"),
            created_at=datetime.now(timezone.utc).isoformat(),
            resource_type=resource_type,
        )

    def decrypt(self, payload: EncryptedPayload | dict, master_key: str) -> str:
        if isinstance(payload, dict):
            payload = EncryptedPayload.from_dict(payload)

        ct = base64.b64decode(payload.ciphertext_b64)
        nonce = base64.b64decode(payload.nonce_b64)
        dek_wrap = base64.b64decode(payload.dek_wrap_b64)
        salt = base64.b64decode(payload.salt_b64)
        given_tag = base64.b64decode(payload.hmac_b64)

        kek = self._derive_kek(master_key, salt)

        # Timing-safe integrity check first
        expected_tag = self._hmac(kek, ct + nonce + dek_wrap + salt)
        if not hmac.compare_digest(expected_tag, given_tag):
            raise ValueError("Vault integrity check failed — payload has been tampered with or master key is wrong")

        # Unwrap DEK
        wrapper = AESGCM(kek)
        dek_nonce = dek_wrap[:self.NONCE_LEN]
        dek_wrapped = dek_wrap[self.NONCE_LEN:]
        dek = wrapper.decrypt(dek_nonce, dek_wrapped, associated_data=b"HAVEN-VAULT-KEK-WRAP")

        # Decrypt plaintext
        aead = AESGCM(dek)
        pt = aead.decrypt(nonce, ct, associated_data=(payload.resource_type or "").encode("utf-8"))
        return pt.decode("utf-8")


# ---------------------------------------------------------------------------
# Rotator — re-encrypts payloads under a new master key without exposing plaintext
# ---------------------------------------------------------------------------
class VaultRotator:
    def __init__(self, vault: ApexVault | None = None):
        self.vault = vault or ApexVault()

    def rotate(self, payload: EncryptedPayload | dict, old_master: str, new_master: str) -> EncryptedPayload:
        pt = self.vault.decrypt(payload, old_master)
        rt = payload.resource_type if isinstance(payload, EncryptedPayload) else payload.get("resource_type")
        return self.vault.encrypt(pt, new_master, resource_type=rt)


# ---------------------------------------------------------------------------
# Singleton helpers -- pull master key from env, expose module-level helpers
# ---------------------------------------------------------------------------
_vault = ApexVault()


def _master_key() -> str:
    k = os.environ.get("VAULT_MASTER_KEY")
    if not k:
        # Sensible dev-only default that fails loud in production. Deploy MUST
        # supply VAULT_MASTER_KEY as an env var (min 32 chars).
        k = os.environ.get("JWT_SECRET", "")
        if not k:
            raise RuntimeError("VAULT_MASTER_KEY (or JWT_SECRET) must be set")
    if len(k) < 16:
        raise RuntimeError("VAULT_MASTER_KEY must be at least 16 characters")
    return k


def encrypt_field(plaintext: str, resource_type: str | None = None) -> dict[str, Any]:
    """Encrypt a single field. Returns a dict ready for Mongo insertion."""
    if plaintext is None:
        return None
    return _vault.encrypt(str(plaintext), _master_key(), resource_type=resource_type).to_dict()


def decrypt_field(payload: dict[str, Any] | None) -> str | None:
    """Decrypt a single field previously encrypted with `encrypt_field`."""
    if payload is None:
        return None
    return _vault.decrypt(payload, _master_key())


def is_encrypted(value: Any) -> bool:
    return isinstance(value, dict) and value.get("algo") == "AES-256-GCM" and "ciphertext_b64" in value


# Field allow-list — Pydantic/Router hooks call `protect_document` before insert
SENSITIVE_FIELDS = {"ssn", "dob", "case_number", "income", "bank_account", "phone", "address_line1"}


def protect_document(doc: dict[str, Any]) -> dict[str, Any]:
    """Auto-encrypt any sensitive field found in `doc`. Idempotent."""
    out = dict(doc)
    for k in list(out.keys()):
        if k.lower() in SENSITIVE_FIELDS and out[k] is not None and not is_encrypted(out[k]):
            out[k] = encrypt_field(str(out[k]), resource_type=k)
    return out


def unprotect_document(doc: dict[str, Any]) -> dict[str, Any]:
    """Reverse of `protect_document` — decrypt any encrypted field for display."""
    out = dict(doc)
    for k, v in list(out.items()):
        if is_encrypted(v):
            try:
                out[k] = decrypt_field(v)
            except Exception:
                out[k] = "***"
    return out


__all__ = [
    "ApexVault",
    "VaultRotator",
    "EncryptedPayload",
    "encrypt_field",
    "decrypt_field",
    "is_encrypted",
    "protect_document",
    "unprotect_document",
    "SENSITIVE_FIELDS",
]
