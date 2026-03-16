import { Address, TonClient4 } from '@ton/ton';
import { CHAIN, ChainId } from '@tonconnect/ui-react';
import { Buffer } from 'buffer';
import { CHAIN_TETRA } from '../../utils/network';
import { TonApiClient } from '@ton-api/client';

function isTonApiClient(client: TonClient4 | TonApiClient): client is TonApiClient {
    return 'http' in client;
}

export class TonApiService {
    public static create(client: TonClient4 | ChainId | TonApiClient): TonApiService {
        if (client === CHAIN.MAINNET) {
            client = new TonClient4({
                endpoint: 'https://mainnet-v4.tonhubapi.com'
            });
        } else if (client === CHAIN.TESTNET) {
            client = new TonClient4({
                endpoint: 'https://testnet-v4.tonhubapi.com'
            });
        } else if (client === CHAIN_TETRA) {
            client = new TonApiClient({
                baseUrl: 'https://tetra.tonapi.io'
            });
        } else if (typeof client === 'string') {
            throw new Error(
                `Unknown network: ${client}. Only ${CHAIN.MAINNET}, ${CHAIN.TESTNET} and ${CHAIN_TETRA} are supported.`
            );
        }
        return new TonApiService(client);
    }

    private readonly client: TonClient4 | TonApiClient;

    private constructor(client: TonClient4 | TonApiClient) {
        this.client = client;
    }

    /**
     * Get wallet public key by address.
     */

    public async getWalletPublicKey(address: string): Promise<Buffer> {
        if (isTonApiClient(this.client)) {
            const response = await this.client.accounts.getAccountPublicKey(Address.parse(address));
            return Buffer.from(response.publicKey, 'hex');
        }

        const masterAt = await this.client.getLastBlock();
        const result = await this.client.runMethod(
            masterAt.last.seqno,
            Address.parse(address),
            'get_public_key',
            []
        );
        return Buffer.from(result.reader.readBigNumber().toString(16).padStart(64, '0'), 'hex');
    }

    /**
     * Get account info by address.
     */
    public async getAccountInfo(
        address: string
    ): Promise<
        ReturnType<TonClient4['getAccount']> | ReturnType<TonApiClient['accounts']['getAccount']>
    > {
        if (isTonApiClient(this.client)) {
            return this.client.accounts.getAccount(Address.parse(address));
        }
        const masterAt = await this.client.getLastBlock();
        return await this.client.getAccount(masterAt.last.seqno, Address.parse(address));
    }
}
