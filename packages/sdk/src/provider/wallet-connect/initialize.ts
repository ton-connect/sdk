import type { UniversalConnector } from '@reown/appkit-universal-connector';
import { WalletConnectOptions } from 'src/provider/wallet-connect/models/wallet-connect-options';
import { TonConnectError } from 'src/errors';

const state: {
    UniversalConnectorCls?: typeof UniversalConnector;
    walletConnectOptions?: WalletConnectOptions;
} = {};

export function initializeWalletConnect(
    UniversalConnectorCls: typeof UniversalConnector,
    walletConnectOptions: WalletConnectOptions
) {
    if (state?.walletConnectOptions !== undefined || state?.UniversalConnectorCls !== undefined) {
        throw new TonConnectError('Wallet Connect already initialized.');
    }

    state.UniversalConnectorCls = UniversalConnectorCls;
    state.walletConnectOptions = walletConnectOptions;
}

export function isWalletConnectInitialized() {
    return state.UniversalConnectorCls !== undefined && state.walletConnectOptions !== undefined;
}

export function getUniversalConnector(): typeof UniversalConnector {
    if (state.UniversalConnectorCls === undefined) {
        throw new TonConnectError('Wallet Connect is not initialized.');
    }
    return state.UniversalConnectorCls;
}

export function getWalletConnectOptions(): WalletConnectOptions {
    if (state.walletConnectOptions === undefined) {
        throw new TonConnectError('Wallet Connect is not initialized.');
    }
    return state.walletConnectOptions;
}
