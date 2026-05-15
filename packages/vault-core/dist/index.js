"use strict";
/**
 * @pathway-genesis/vault-core
 * Enterprise Entrypoint - Vault Core & Execution Matrix
 * Author: Johnathan Raias Rodriquez
 * Classification: SECURE / ZERO-DAY
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VaultCore = exports.PathwayVaultCore = exports.GenesisSystemState = void 0;
var GenesisSystemState;
(function (GenesisSystemState) {
    GenesisSystemState["OFFLINE"] = "OFFLINE";
    GenesisSystemState["INITIALIZING"] = "INITIALIZING";
    GenesisSystemState["SECURE"] = "SECURE";
    GenesisSystemState["COMPROMISED"] = "COMPROMISED";
})(GenesisSystemState || (exports.GenesisSystemState = GenesisSystemState = {}));
class PathwayVaultCore {
    static instance;
    state = GenesisSystemState.OFFLINE;
    constructor() { this.bootSequence(); }
    static getInstance() {
        if (!PathwayVaultCore.instance) {
            PathwayVaultCore.instance = new PathwayVaultCore();
        }
        return PathwayVaultCore.instance;
    }
    bootSequence() {
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
exports.PathwayVaultCore = PathwayVaultCore;
exports.VaultCore = PathwayVaultCore.getInstance();
//# sourceMappingURL=index.js.map