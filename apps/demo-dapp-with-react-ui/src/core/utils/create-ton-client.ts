import { TonClient, type TonClientParameters } from '@ton/ton';

export type TonCenterNetwork = 'mainnet' | 'testnet';
export type TonChain = '-239' | '-3';

const TONCENTER_ENDPOINT_BY_CHAIN: Record<TonChain, string> = {
    '-239': 'https://toncenter.com/api/v2/jsonRPC',
    '-3': 'https://testnet.toncenter.com/api/v2/jsonRPC'
};

const readEnv = (key: string): string | undefined => {
    const value = import.meta.env[key];
    return typeof value === 'string' && value.length > 0 ? value : undefined;
};

/** Optional TonCenter API keys (https://toncenter.com — avoids public RPC rate limits). */
export function toncenterApiKeyForChain(chain: TonChain): string | undefined {
    const shared = readEnv('VITE_TONCENTER_API_KEY');
    if (chain === '-239') {
        return readEnv('VITE_TONCENTER_MAINNET_API_KEY') ?? shared;
    }
    return readEnv('VITE_TONCENTER_TESTNET_API_KEY') ?? shared;
}

export function toncenterApiKeyForNetwork(network: TonCenterNetwork): string | undefined {
    return toncenterApiKeyForChain(network === 'mainnet' ? '-239' : '-3');
}

export function tonClientParametersForChain(chain: TonChain): TonClientParameters {
    const parameters: TonClientParameters = { endpoint: TONCENTER_ENDPOINT_BY_CHAIN[chain] };
    const apiKey = toncenterApiKeyForChain(chain);
    if (apiKey) {
        parameters.apiKey = apiKey;
    }
    return parameters;
}

export function createTonClient(chain: TonChain): TonClient {
    return new TonClient(tonClientParametersForChain(chain));
}

export function createTonClientForNetwork(network: TonCenterNetwork): TonClient {
    return createTonClient(network === 'mainnet' ? '-239' : '-3');
}
