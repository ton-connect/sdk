import { SignatureDomain } from '@ton/ton';
import { CHAIN } from '@tonconnect/sdk';

export function getDomain(network: string): SignatureDomain {
    return network === CHAIN.MAINNET || network === CHAIN.TESTNET
        ? { type: 'empty' }
        : {
              type: 'l2',
              globalId: Number(network)
          };
}
