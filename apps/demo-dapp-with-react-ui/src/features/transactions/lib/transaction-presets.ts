export interface TransactionMessage {
    address: string;
    amount: string; // Always stored in nanotons
    stateInit?: string;
    payload?: string;
}

export type AmountUnit = 'TON' | 'nano';

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
