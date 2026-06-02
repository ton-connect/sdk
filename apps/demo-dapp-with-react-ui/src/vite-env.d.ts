/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_TONCENTER_API_KEY?: string;
    readonly VITE_TONCENTER_MAINNET_API_KEY?: string;
    readonly VITE_TONCENTER_TESTNET_API_KEY?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

declare module 'prismjs/components/prism-core' {
    import type { Grammar } from 'prismjs';
    export const languages: Record<string, Grammar>;
    export function highlight(text: string, grammar: Grammar, language: string): string;
}
