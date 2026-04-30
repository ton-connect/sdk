import { CHAIN, ConnectRequest } from '@tonconnect/protocol';
import { SendTransactionRequest } from 'src/models';

// ── Shared constants ──────────────────────────────────────────────────────────

export const SESSION_ID = '7730cae23f454f8d4ba52b07a4ea869773834be331edcadbb5e2da5d94ddfa2d';
export const TRACE_ID = '019d85ea-ca0e-7129-8155-05c7534ef894';
export const VALID_UNTIL = 1761071945;
export const MANIFEST_URL = 'https://tonconnect-sdk-demo-dapp.vercel.app/tonconnect-manifest.json';
export const PROOF_PAYLOAD = '9912d6177365fcc75c16bf5e3cfdbc2d7b1045dc1162b9d8216d3a3429f15211';

export const USDT_MASTER = 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs';
export const RECIPIENT = 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs';
export const SENDER = 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs';
export const BOC_PAYLOAD = 'te6cckEBAQEADAAAFAAAAABIZWxsbyGVgYQo';

// ── Universal link variants ───────────────────────────────────────────────────

export const STANDARD_LINK = 'tc://';
/** Direct Telegram bot deep-link. */
export const TG_DIRECT_LINK = 'https://t.me/wallet/start';
/** Legacy Telegram attach-param link (converted to direct internally). */
export const TG_ATTACH_LINK = 'https://t.me/wallet?attach=wallet';

// ── Connect request variants ──────────────────────────────────────────────────

/** Full connect request — ton_addr + ton_proof. */
export const WITH_PROOF_CONNECT: ConnectRequest = {
    items: [
        { name: 'ton_addr', network: CHAIN.MAINNET },
        { name: 'ton_proof', payload: PROOF_PAYLOAD }
    ],
    manifestUrl: MANIFEST_URL
};

/** Minimal connect request — ton_addr only, no proof required. */
export const NO_PROOF_CONNECT: ConnectRequest = {
    items: [{ name: 'ton_addr' }],
    manifestUrl: MANIFEST_URL
};

// ── Test case type ────────────────────────────────────────────────────────────

export interface UniversalLinkCase {
    label: string;
    universalLink: string;
    sessionId: string;
    traceId: string;
    connectRequest: ConnectRequest;
    /** null → connect-only (no embeddedRequest / no req param). */
    txRequest: SendTransactionRequest | null;
}

// ── Test cases ────────────────────────────────────────────────────────────────

export const CASES: UniversalLinkCase[] = [
    // ── Standard tc:// — with proof ──────────────────────────────────────────

    {
        label: '2 jetton transfers (items)',
        universalLink: STANDARD_LINK,
        sessionId: SESSION_ID,
        traceId: TRACE_ID,
        connectRequest: WITH_PROOF_CONNECT,
        txRequest: {
            network: CHAIN.MAINNET,
            validUntil: VALID_UNTIL,
            items: [
                {
                    type: 'jetton',
                    master: USDT_MASTER,
                    destination: RECIPIENT,
                    amount: '10000000',
                    responseDestination: SENDER,
                    forwardAmount: '10000'
                },
                {
                    type: 'jetton',
                    master: USDT_MASTER,
                    destination: RECIPIENT,
                    amount: '5000000',
                    responseDestination: SENDER,
                    forwardAmount: '5000'
                }
            ]
        }
    },
    {
        label: '1 TON transfer with payload (messages)',
        universalLink: STANDARD_LINK,
        sessionId: SESSION_ID,
        traceId: TRACE_ID,
        connectRequest: WITH_PROOF_CONNECT,
        txRequest: {
            validUntil: VALID_UNTIL,
            messages: [{ address: RECIPIENT, amount: '1000000000', payload: BOC_PAYLOAD }]
        }
    },
    {
        label: '1 TON transfer with payload (items)',
        universalLink: STANDARD_LINK,
        sessionId: SESSION_ID,
        traceId: TRACE_ID,
        connectRequest: WITH_PROOF_CONNECT,
        txRequest: {
            validUntil: VALID_UNTIL,
            items: [{ type: 'ton', address: RECIPIENT, amount: '1000000000', payload: BOC_PAYLOAD }]
        }
    },
    {
        label: '1 TON transfer without payload (messages)',
        universalLink: STANDARD_LINK,
        sessionId: SESSION_ID,
        traceId: TRACE_ID,
        connectRequest: WITH_PROOF_CONNECT,
        txRequest: {
            validUntil: VALID_UNTIL,
            messages: [{ address: RECIPIENT, amount: '1000000000' }]
        }
    },
    {
        label: '1 TON transfer without payload (items)',
        universalLink: STANDARD_LINK,
        sessionId: SESSION_ID,
        traceId: TRACE_ID,
        connectRequest: WITH_PROOF_CONNECT,
        txRequest: {
            validUntil: VALID_UNTIL,
            items: [{ type: 'ton', address: RECIPIENT, amount: '1000000000' }]
        }
    },
    {
        label: 'TON + jetton transfer (items)',
        universalLink: STANDARD_LINK,
        sessionId: SESSION_ID,
        traceId: TRACE_ID,
        connectRequest: WITH_PROOF_CONNECT,
        txRequest: {
            network: CHAIN.MAINNET,
            validUntil: VALID_UNTIL,
            items: [
                { type: 'ton', address: RECIPIENT, amount: '100000000' },
                {
                    type: 'jetton',
                    master: USDT_MASTER,
                    destination: RECIPIENT,
                    amount: '10000000',
                    responseDestination: SENDER,
                    forwardAmount: '10000'
                }
            ]
        }
    },
    {
        label: '1 jetton transfer with forward & custom payload (items)',
        universalLink: STANDARD_LINK,
        sessionId: SESSION_ID,
        traceId: TRACE_ID,
        connectRequest: WITH_PROOF_CONNECT,
        txRequest: {
            validUntil: VALID_UNTIL,
            items: [
                {
                    type: 'jetton',
                    master: USDT_MASTER,
                    destination: RECIPIENT,
                    amount: '10000000',
                    responseDestination: SENDER,
                    forwardAmount: '50',
                    forwardPayload: BOC_PAYLOAD,
                    customPayload: BOC_PAYLOAD
                }
            ]
        }
    },
    {
        label: '1 jetton transfer with attachAmount and queryId (items)',
        universalLink: STANDARD_LINK,
        sessionId: SESSION_ID,
        traceId: TRACE_ID,
        connectRequest: WITH_PROOF_CONNECT,
        txRequest: {
            validUntil: VALID_UNTIL,
            items: [
                {
                    type: 'jetton',
                    master: USDT_MASTER,
                    destination: RECIPIENT,
                    amount: '10000000',
                    attachAmount: '50000000',
                    queryId: '42'
                }
            ]
        }
    },
    {
        label: 'sendTransaction with explicit from and network (messages)',
        universalLink: STANDARD_LINK,
        sessionId: SESSION_ID,
        traceId: TRACE_ID,
        connectRequest: WITH_PROOF_CONNECT,
        txRequest: {
            network: CHAIN.TESTNET,
            from: SENDER,
            validUntil: VALID_UNTIL,
            messages: [{ address: RECIPIENT, amount: '500000000' }]
        }
    },
    {
        label: 'connect-only (no embeddedRequest)',
        universalLink: STANDARD_LINK,
        sessionId: SESSION_ID,
        traceId: TRACE_ID,
        connectRequest: WITH_PROOF_CONNECT,
        txRequest: null
    },
    {
        label: 'Telegram direct link — 1 TON transfer without payload (messages)',
        universalLink: TG_DIRECT_LINK,
        sessionId: SESSION_ID,
        traceId: TRACE_ID,
        connectRequest: WITH_PROOF_CONNECT,
        txRequest: {
            validUntil: VALID_UNTIL,
            messages: [{ address: RECIPIENT, amount: '1' }]
        }
    },

    // ── Legacy https://t.me/wallet?attach=wallet — with proof ────────────────

    {
        label: 'Telegram attach link — 1 TON transfer without payload (messages)',
        universalLink: TG_ATTACH_LINK,
        sessionId: SESSION_ID,
        traceId: TRACE_ID,
        connectRequest: WITH_PROOF_CONNECT,
        txRequest: {
            validUntil: VALID_UNTIL,
            messages: [{ address: RECIPIENT, amount: '1000000000' }]
        }
    },
    {
        label: 'Telegram attach link — TON + jetton transfer (items)',
        universalLink: TG_ATTACH_LINK,
        sessionId: SESSION_ID,
        traceId: TRACE_ID,
        connectRequest: WITH_PROOF_CONNECT,
        txRequest: {
            network: CHAIN.MAINNET,
            validUntil: VALID_UNTIL,
            items: [
                { type: 'ton', address: RECIPIENT, amount: '100000000' },
                {
                    type: 'jetton',
                    master: USDT_MASTER,
                    destination: RECIPIENT,
                    amount: '10000000',
                    responseDestination: SENDER,
                    forwardAmount: '10000'
                }
            ]
        }
    },
    {
        label: 'Telegram attach link — 2 jetton transfers (items)',
        universalLink: TG_ATTACH_LINK,
        sessionId: SESSION_ID,
        traceId: TRACE_ID,
        connectRequest: WITH_PROOF_CONNECT,
        txRequest: {
            network: CHAIN.MAINNET,
            validUntil: VALID_UNTIL,
            items: [
                {
                    type: 'jetton',
                    master: USDT_MASTER,
                    destination: RECIPIENT,
                    amount: '10000000',
                    responseDestination: SENDER,
                    forwardAmount: '10000'
                },
                {
                    type: 'jetton',
                    master: USDT_MASTER,
                    destination: RECIPIENT,
                    amount: '5000000',
                    responseDestination: SENDER,
                    forwardAmount: '5000'
                }
            ]
        }
    },
    {
        label: 'Telegram attach link — connect-only (no embeddedRequest)',
        universalLink: TG_ATTACH_LINK,
        sessionId: SESSION_ID,
        traceId: TRACE_ID,
        connectRequest: WITH_PROOF_CONNECT,
        txRequest: null
    },

    // ── Standard tc:// — no proof ─────────────────────────────────────────────

    {
        label: 'no-proof: 1 TON transfer without payload (messages)',
        universalLink: STANDARD_LINK,
        sessionId: SESSION_ID,
        traceId: TRACE_ID,
        connectRequest: NO_PROOF_CONNECT,
        txRequest: {
            validUntil: VALID_UNTIL,
            messages: [{ address: RECIPIENT, amount: '1000000000' }]
        }
    },
    {
        label: 'no-proof: 2 jetton transfers (items)',
        universalLink: STANDARD_LINK,
        sessionId: SESSION_ID,
        traceId: TRACE_ID,
        connectRequest: NO_PROOF_CONNECT,
        txRequest: {
            network: CHAIN.MAINNET,
            validUntil: VALID_UNTIL,
            items: [
                {
                    type: 'jetton',
                    master: USDT_MASTER,
                    destination: RECIPIENT,
                    amount: '10000000',
                    responseDestination: SENDER,
                    forwardAmount: '10000'
                },
                {
                    type: 'jetton',
                    master: USDT_MASTER,
                    destination: RECIPIENT,
                    amount: '5000000',
                    responseDestination: SENDER,
                    forwardAmount: '5000'
                }
            ]
        }
    },
    {
        label: 'no-proof: 1 jetton with forward & custom payload (items)',
        universalLink: STANDARD_LINK,
        sessionId: SESSION_ID,
        traceId: TRACE_ID,
        connectRequest: NO_PROOF_CONNECT,
        txRequest: {
            validUntil: VALID_UNTIL,
            items: [
                {
                    type: 'jetton',
                    master: USDT_MASTER,
                    destination: RECIPIENT,
                    amount: '10000000',
                    responseDestination: SENDER,
                    forwardAmount: '50',
                    forwardPayload: BOC_PAYLOAD,
                    customPayload: BOC_PAYLOAD
                }
            ]
        }
    },
    {
        label: 'no-proof: Telegram attach link — connect-only (no embeddedRequest)',
        universalLink: TG_ATTACH_LINK,
        sessionId: SESSION_ID,
        traceId: TRACE_ID,
        connectRequest: NO_PROOF_CONNECT,
        txRequest: null
    }
];
