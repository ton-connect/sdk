import { CHAIN } from '@tonconnect/ui-react';
import { TonClient, type TonClientParameters } from '@ton/ton';

import { endpointByChain } from './ton-endpoints';

export type TonCenterNetwork = 'mainnet' | 'testnet';

const readEnv = (key: string): string | undefined => {
    const value = import.meta.env[key];
    return typeof value === 'string' && value.length > 0 ? value : undefined;
};

/** Optional TonCenter API keys (https://toncenter.com — avoids public RPC rate limits). */
export function toncenterApiKeyForChain(chain: CHAIN): string | undefined {
    const shared = readEnv('VITE_TONCENTER_API_KEY');
    if (chain === CHAIN.MAINNET) {
        return readEnv('VITE_TONCENTER_MAINNET_API_KEY') ?? shared;
    }
    return readEnv('VITE_TONCENTER_TESTNET_API_KEY') ?? shared;
}

export function toncenterApiKeyForNetwork(network: TonCenterNetwork): string | undefined {
    return toncenterApiKeyForChain(network === 'mainnet' ? CHAIN.MAINNET : CHAIN.TESTNET);
}

export function tonClientParametersForChain(chain: CHAIN): TonClientParameters {
    const parameters: TonClientParameters = { endpoint: endpointByChain[chain] };
    const apiKey = toncenterApiKeyForChain(chain);
    if (apiKey) {
        parameters.apiKey = apiKey;
    }
    return parameters;
}

export function createTonClient(chain: CHAIN): TonClient {
    return new TonClient(tonClientParametersForChain(chain));
}

export function createTonClientForNetwork(network: TonCenterNetwork): TonClient {
    return createTonClient(network === 'mainnet' ? CHAIN.MAINNET : CHAIN.TESTNET);
}
