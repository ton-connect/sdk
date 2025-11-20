import { WalletConnectOptions } from 'src/provider/wallet-connect/models/wallet-connect-options';
import { TonConnectError } from 'src/errors';

const state: {
    UniversalConnectorCls?: unknown;
    walletConnectOptions?: WalletConnectOptions;
} = {};

/**
 * Initializes the WalletConnect integration.
 *
 * This function must be called once before using WalletConnect features.
 * A second call will throw an error to prevent accidental re-initialization.
 *
 * @param UniversalConnectorCls - A UniversalConnector class imported from '@reown/appkit-universal-connector'
 * @param {WalletConnectOptions} walletConnectOptions - Configuration options used for initializing WalletConnect.
 * @example
 * import { UniversalConnector } from '@reown/appkit-universal-connector';
 *
 * initializeWalletConnect(UniversalConnector, {
 *     projectId: 'abcd1234abcd1234abcd1234abcd1234',
 *     metadata: {
 *         name: 'Demo DApp',
 *         icons: [
 *             'https://example.com/my-icon.png'
 *         ],
 *         url: window.location.origin,
 *         description: 'Demo DApp'
 *     }
 * });
 */
export function initializeWalletConnect(
    UniversalConnectorCls: Function,
    walletConnectOptions: WalletConnectOptions
) {
    if (state?.walletConnectOptions !== undefined || state?.UniversalConnectorCls !== undefined) {
        throw new TonConnectError('Wallet Connect already initialized.');
    }

    if (typeof UniversalConnectorCls !== 'function' || !('init' in UniversalConnectorCls)) {
        throw new TonConnectError('Initialize UniversalConnectorCls must be set');
    }

    state.UniversalConnectorCls = UniversalConnectorCls;
    state.walletConnectOptions = walletConnectOptions;
}

export function isWalletConnectInitialized() {
    return state.UniversalConnectorCls !== undefined && state.walletConnectOptions !== undefined;
}

export function getUniversalConnector(): { init: Function } {
    if (state.UniversalConnectorCls === undefined) {
        throw new TonConnectError('Wallet Connect is not initialized.');
    }
    return state.UniversalConnectorCls as { init: Function };
}

export function getWalletConnectOptions(): WalletConnectOptions {
    if (state.walletConnectOptions === undefined) {
        throw new TonConnectError('Wallet Connect is not initialized.');
    }
    return state.walletConnectOptions;
}
