import { beginCell } from '@ton/ton';
import type { SendTransactionRequest } from '@tonconnect/ui-react';

import { DEMO_ECHO_ADDRESS } from '../../send-transaction/utils/transaction-presets';

const VALID_UNTIL_DEFAULT_SEC = 600;

const validUntilDefault = () => Math.floor(Date.now() / 1000) + VALID_UNTIL_DEFAULT_SEC;

const commentPayload = (text: string) =>
    beginCell().storeUint(0, 32).storeStringTail(text).endCell().toBoc().toString('base64');

/** Default signMessage example: one internal message with a text comment. */
export const buildDefaultSignMessage = (): SendTransactionRequest => ({
    validUntil: validUntilDefault(),
    messages: [
        {
            address: DEMO_ECHO_ADDRESS,
            amount: '1000000',
            payload: commentPayload('Hello from signMessage')
        }
    ]
});

/** Typical gasless-style batch: wallet signs two internal messages at once. */
export const buildTwoMessageSignMessage = (): SendTransactionRequest => ({
    validUntil: validUntilDefault(),
    messages: [
        {
            address: DEMO_ECHO_ADDRESS,
            amount: '1000000',
            payload: commentPayload('First message')
        },
        {
            address: DEMO_ECHO_ADDRESS,
            amount: '1000000',
            payload: commentPayload('Second message')
        }
    ]
});

/** Items-shaped signMessage with a single GRAM transfer and comment payload. */
export const buildTonItemSignMessage = (): SendTransactionRequest => ({
    validUntil: validUntilDefault(),
    items: [
        {
            type: 'ton',
            address: DEMO_ECHO_ADDRESS,
            amount: '1000000',
            payload: commentPayload('Items-shaped signMessage')
        }
    ]
});

export type SignMessagePresetKey = 'default' | 'two-messages' | 'ton-item';

export interface SignMessagePresetDescriptor {
    id: SignMessagePresetKey;
    name: string;
    description: string;
}

export const SIGN_MESSAGE_PRESETS: readonly SignMessagePresetDescriptor[] = [
    {
        id: 'default',
        name: 'Text comment',
        description: 'Single internal message with a short text payload (common signMessage case).'
    },
    {
        id: 'two-messages',
        name: 'Two messages',
        description: 'Batch of two internal messages — similar to gasless relay signing.'
    },
    {
        id: 'ton-item',
        name: 'Structured GRAM item',
        description: 'Items-shaped request with one GRAM transfer and a comment payload.'
    }
];

export function buildSignMessagePreset(key: SignMessagePresetKey): SendTransactionRequest {
    if (key === 'two-messages') {
        return buildTwoMessageSignMessage();
    }

    if (key === 'ton-item') {
        return buildTonItemSignMessage();
    }

    return buildDefaultSignMessage();
}
