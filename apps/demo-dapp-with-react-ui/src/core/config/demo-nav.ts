import type { ComponentType } from 'react';
import {
    CircleDollarSign,
    FileSignature,
    FlaskConical,
    MessageSquare,
    Paintbrush,
    Search,
    Send,
    ShieldCheck,
    TreePine,
    Wallet
} from 'lucide-react';

/** Official TON Connect how-to and reference links (page headers). */
export const TON_CONNECT_DOCS = {
    overview: 'https://docs.ton.org/applications/ton-connect/overview',
    sendTransaction: 'https://docs.ton.org/applications/ton-connect/how-to/send-transaction',
    sendTransactionJetton:
        'https://docs.ton.org/applications/ton-connect/how-to/send-transaction#jetton-transfer',
    signData: 'https://docs.ton.org/applications/ton-connect/how-to/sign-data',
    signMessage: 'https://docs.ton.org/applications/ton-connect/how-to/sign-message-gasless',
    embeddedRequest: 'https://docs.ton.org/applications/ton-connect/how-to/embedded-request',
    /** Alias for gasless jetton flows (e.g. USDT transfer). */
    gasless: 'https://docs.ton.org/applications/ton-connect/how-to/sign-message-gasless',
    tonProof:
        'https://docs.ton.org/applications/ton-connect/how-to/connect#authenticate-with-ton_proof',
    connect: 'https://docs.ton.org/applications/ton-connect/how-to/connect'
} as const;

export type DemoNavLink = {
    to: string;
    label: string;
    icon: ComponentType<{ className?: string }>;
};

export type DemoNavGroup = {
    label: string;
    links: readonly DemoNavLink[];
};

export const DEMO_NAV_GROUPS: readonly DemoNavGroup[] = [
    {
        label: 'TON Connect methods',
        links: [
            { to: '/tx-form', label: 'Send transaction', icon: Send },
            { to: '/sign-data', label: 'Sign data', icon: FileSignature },
            { to: '/sign-message', label: 'Sign message', icon: MessageSquare }
        ]
    },
    {
        label: 'Custom transactions',
        links: [
            { to: '/transfer-usdt', label: 'USDT transfer', icon: CircleDollarSign },
            { to: '/merkle', label: 'Merkle proof', icon: TreePine },
            { to: '/create-jetton', label: 'Create jetton', icon: Wallet }
        ]
    },
    {
        label: 'Utils',
        links: [
            { to: '/widget-builder', label: 'Widget builder', icon: Paintbrush },
            { to: '/widget-sandbox', label: 'Export sandbox', icon: FlaskConical },
            { to: '/ton-proof', label: 'Ton proof', icon: ShieldCheck },
            { to: '/find-tx', label: 'Find transaction', icon: Search }
        ]
    }
];
