import { describe, it, expect } from 'vitest';
import { stripWalletNameNote } from 'src/app/utils/wallets';

describe('app/utils/wallets: stripWalletNameNote', () => {
    it.each([
        ['Walt (ex. Wallet)', 'Walt'],
        ['Gram Wallet', 'Gram Wallet'],
        ['Wallet (beta) Pro', 'Wallet (beta) Pro'],
        ['(ex. Wallet)', '(ex. Wallet)'],
        ['A (b (c))', 'A (b (c))']
    ])('strips %s to %s', (input, expected) => {
        expect(stripWalletNameNote(input)).toBe(expected);
    });
});
