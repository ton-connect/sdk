import { Address, TonClient4 } from '@ton/ton';
import { CHAIN } from '@tonconnect/ui-react';
import { Buffer } from 'buffer';

const ENDPOINTS: Record<string, string> = {
  [CHAIN.MAINNET]: 'https://mainnet-v4.tonhubapi.com',
  [CHAIN.TESTNET]: 'https://testnet-v4.tonhubapi.com'
};

export class TonApiService {
  private readonly client: TonClient4;

  constructor(network: string) {
    const endpoint = ENDPOINTS[network];
    if (!endpoint) {
      throw new Error(`Unknown network: ${network}`);
    }
    this.client = new TonClient4({ endpoint });
  }

  async getWalletPublicKey(address: string): Promise<Buffer | null> {
    try {
      const masterAt = await this.client.getLastBlock();
      const result = await this.client.runMethod(
        masterAt.last.seqno,
        Address.parse(address),
        'get_public_key',
        []
      );
      return Buffer.from(result.reader.readBigNumber().toString(16).padStart(64, '0'), 'hex');
    } catch {
      return null;
    }
  }

  async getAccountInfo(address: string) {
    const masterAt = await this.client.getLastBlock();
    return await this.client.getAccount(masterAt.last.seqno, Address.parse(address));
  }
}
