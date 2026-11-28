import { beginCell } from '@ton/ton';
import type { SendTransactionRequest } from '@tonconnect/ui-react';

const defaultBody = beginCell().storeUint(0, 32).storeStringTail('Hello!').endCell();

const ECHO_STATE_INIT =
    'te6cckEBBAEAOgACATQCAQAAART/APSkE/S88sgLAwBI0wHQ0wMBcbCRW+D6QDBwgBDIywVYzxYh+gLLagHPFsmAQPsAlxCarA==';

/** Echo contract used in demo transaction presets and batch limits defaults. */
export const DEMO_ECHO_ADDRESS = 'EQCKWpx7cNMpvmcN5ObM5lLUZHZRFKqYA4xmw9jOry0ZsF9M';
const JETTON_MASTER = 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs';

const VALID_UNTIL_DEFAULT_SEC = 600;

/** Single message + stateInit + payload (echo contract demo). */
export const buildDefaultTx = (): SendTransactionRequest => ({
    validUntil: Math.floor(Date.now() / 1000) + VALID_UNTIL_DEFAULT_SEC,
    messages: [
        {
            address: DEMO_ECHO_ADDRESS,
            amount: '5000000',
            payload: defaultBody.toBoc().toString('base64'),
            stateInit: ECHO_STATE_INIT
        }
    ]
});

/** Items-shaped request: a ton transfer + a jetton transfer. */
export const buildItemsTx = (): SendTransactionRequest => ({
    validUntil: Math.floor(Date.now() / 1000) + VALID_UNTIL_DEFAULT_SEC,
    items: [
        {
            type: 'ton',
            address: DEMO_ECHO_ADDRESS,
            amount: '5000000',
            payload: defaultBody.toBoc().toString('base64'),
            stateInit: ECHO_STATE_INIT
        },
        {
            type: 'jetton',
            master: JETTON_MASTER,
            amount: '50000',
            destination: DEMO_ECHO_ADDRESS
        }
    ]
});

/** Items-shaped NFT transfer request. `newOwner` is filled by the caller. */
export const buildNftItemsTx = (newOwner?: string): SendTransactionRequest => ({
    validUntil: Math.floor(Date.now() / 1000) + VALID_UNTIL_DEFAULT_SEC,
    items: [
        {
            type: 'nft',
            nftAddress: 'TODO: paste NFT item contract address',
            newOwner: newOwner ?? 'TODO: connect a wallet to fill the new owner address'
        }
    ]
});

export type PresetKey = 'default-tx' | 'items-tx' | 'nft-items-tx';

export interface PresetDescriptor {
    id: PresetKey;
    name: string;
    description: string;
}

export const PRESETS: readonly PresetDescriptor[] = [
    {
        id: 'default-tx',
        name: 'Single message',
        description: 'One GRAM transfer with payload + stateInit (echo contract).'
    },
    {
        id: 'items-tx',
        name: 'Items: GRAM + Jetton',
        description: 'Items-shaped request combining a GRAM transfer and a Jetton transfer.'
    },
    {
        id: 'nft-items-tx',
        name: 'NFT transfer',
        description: 'Items-shaped request transferring an NFT to the connected wallet.'
    }
];
