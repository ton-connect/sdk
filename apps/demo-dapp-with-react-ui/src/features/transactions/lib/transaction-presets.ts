/**
 * In-memory form draft for a single message. `id` is a stable identifier used
 * as React key and as map-key for amount-unit / collapsible-expanded state — so
 * those don't drift when messages get reordered or removed mid-list. The id is
 * NOT part of the outgoing TonConnect payload (build-outgoing-messages strips it).
 */
export interface TransactionMessage {
    id: string;
    address: string;
    amount: string; // Always stored in nanotons
    stateInit?: string;
    payload?: string;
}

export type AmountUnit = 'TON' | 'nano';

/** Generate a stable id for a fresh in-memory message. */
export const newMessageId = (): string =>
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);

/** A frozen snapshot of a send attempt — request + wallet response (or error). */
export interface OperationResult {
    id: string;
    timestamp: number;
    /** The exact request JSON sent to the wallet (for replay / debug). */
    requestSnapshot: string;
    /** Pretty-printed wallet response or `{ error: string }`. */
    response: string;
    status: 'success' | 'error';
    errorMessage?: string;
    boc?: string;
    validUntil?: number;
}

export const PRESETS = {
    simple: {
        name: 'Simple Transfer',
        description: 'Basic TON transfer to any address',
        validUntil: 600,
        from: '',
        messages: [
            {
                address: 'EQCKWpx7cNMpvmcN5ObM5lLUZHZRFKqYA4xmw9jOry0ZsF9M',
                amount: '5000000'
            }
        ]
    },
    withPayload: {
        name: 'Transfer with Comment',
        description: 'Include a text message with your transfer',
        validUntil: 600,
        from: '',
        messages: [
            {
                address: 'EQCKWpx7cNMpvmcN5ObM5lLUZHZRFKqYA4xmw9jOry0ZsF9M',
                amount: '10000000',
                payload: 'te6cckEBAQEADAAMABQAAAAASGVsbG8h'
            }
        ]
    },
    multiMessage: {
        name: 'Multiple Messages',
        description: 'Send TON to 2+ recipients in one transaction',
        validUntil: 600,
        from: '',
        messages: [
            {
                address: 'EQCKWpx7cNMpvmcN5ObM5lLUZHZRFKqYA4xmw9jOry0ZsF9M',
                amount: '5000000'
            },
            {
                address: 'EQCD39VS5jcptHL8vMjEXrzGaRcCVYto7HUn4bpAOg8xqB2N',
                amount: '3000000'
            }
        ]
    },
    jetton: {
        name: 'Jetton Transfer',
        description: 'Send fungible tokens (Jettons)',
        validUntil: 600,
        from: '',
        messages: [
            {
                address: 'EQCKWpx7cNMpvmcN5ObM5lLUZHZRFKqYA4xmw9jOry0ZsF9M',
                amount: '50000000',
                payload:
                    'te6cckEBAgEAqwAB4YgBQzYIKlMZvqYGaO2k3+YDIZGkqnSBfSYvklMpBnmOTLbgIUMWCCpTGb6mBmjtpN/mAyGRpKp0gX0mL5JTKQZJjky2wAAAAAAAAAAAAAAAAAEBAGRURVNUIFRSQU5TRkVSIFRPIEpFVFRPTiBXQUxMRVQgV0lUSCBDT01NRU5U'
            }
        ]
    }
} as const;

export type PresetKey = keyof typeof PRESETS;
