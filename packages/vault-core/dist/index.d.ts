/**
 * @pathway-genesis/vault-core
 * Enterprise Entrypoint - Vault Core & Execution Matrix
 * Author: Johnathan Raias Rodriquez
 * Classification: SECURE / ZERO-DAY
 */
export declare enum GenesisSystemState {
    OFFLINE = "OFFLINE",
    INITIALIZING = "INITIALIZING",
    SECURE = "SECURE",
    COMPROMISED = "COMPROMISED"
}
export declare class PathwayVaultCore {
    private static instance;
    private state;
    private constructor();
    static getInstance(): PathwayVaultCore;
    private bootSequence;
}
export declare const VaultCore: PathwayVaultCore;
