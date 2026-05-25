import { Feature } from './feature';

/**
 * Identifies the wallet that the app is connected to, returned in the
 * `payload.device` field of a successful {@link ConnectEventSuccess}.
 */
export interface DeviceInfo {
    /** Host platform the wallet is running on. */
    platform: 'iphone' | 'ipad' | 'android' | 'windows' | 'mac' | 'linux' | 'browser';
    /** Wallet app identifier (e.g. `"tonkeeper"`); matches the entry in `wallets-list`. */
    appName: string; // e.g. "Tonkeeper"
    /** Wallet app version (semver, e.g. `"2.3.367"`). */
    appVersion: string; // e.g. "2.3.367"
    /** Highest TON Connect protocol version the wallet implements. */
    maxProtocolVersion: number;
    /** Features the wallet advertises — see {@link Feature}. */
    features: Feature[];
}
