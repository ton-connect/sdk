import { Feature } from './feature';

/**
 * Wallet self-description returned inside {@link ConnectEventSuccess}'s `payload.device`.
 *
 * @see [`DeviceInfo` (Connect spec)](https://github.com/ton-blockchain/ton-connect/blob/main/spec/connect.md#deviceinfo)
 */
export interface DeviceInfo {
    /** Operating system / runtime the wallet identifies itself with. */
    platform: 'iphone' | 'ipad' | 'android' | 'windows' | 'mac' | 'linux' | 'browser';

    /**
     * Wallet identifier — same value as the `app_name` field in the wallets
     * list.
     *
     * @example "tonkeeper"
     */
    appName: string;

    /**
     * The version of the wallet.
     *
     * @example "2.3.367"
     * */
    appVersion: string;

    /**
     * Highest TON Connect protocol version the wallet implements.
     */
    maxProtocolVersion: number;

    /**
     * Capabilities the wallet advertises.
     */
    features: Feature[];
}
