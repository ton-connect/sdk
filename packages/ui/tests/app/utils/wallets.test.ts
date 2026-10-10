import { describe, it, expect } from 'vitest';
import { splitWalletName } from 'src/app/utils/wallets';

describe('app/utils/wallets: splitWalletName', () => {
    it.each([
        ['Walt (ex. Wallet)', { name: 'Walt', note: 'ex. Wallet' }],
        ['Gram Wallet', { name: 'Gram Wallet' }],
        ['Wallet (beta) Pro', { name: 'Wallet (beta) Pro' }],
        ['(ex. Wallet)', { name: '(ex. Wallet)' }],
        ['A (b (c))', { name: 'A (b (c))' }]
    ])('splits %s', (input, expected) => {
        expect(splitWalletName(input)).toEqual(expected);
    });
});
