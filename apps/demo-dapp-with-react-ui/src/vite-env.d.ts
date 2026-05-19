/// <reference types="vite/client" />

declare module 'prismjs/components/prism-core' {
    import type { Grammar } from 'prismjs';
    export const languages: Record<string, Grammar>;
    export function highlight(text: string, grammar: Grammar, language: string): string;
}
