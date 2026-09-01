import { describe, it, expect } from 'vitest';
import {
    describeWalletConnectionSource,
    WalletConnectionSourceInfo
} from 'src/models/wallet/wallet-connection-source';

const notInsideWalletBrowser = (): boolean => false;
const insideWalletBrowser = (): boolean => true;

describe.each([
    {
        name: 'a single remote wallet',
        source: { universalLink: 'https://app.tonkeeper.com/ton-connect', bridgeUrl: 'https://b' },
        isInsideWalletBrowser: notInsideWalletBrowser,
        expected: { kind: 'http-specific-wallet', bridgeUrl: 'https://b' }
    },
    {
        name: 'the WalletConnect transport',
        source: { type: 'wallet-connect' as const },
        isInsideWalletBrowser: notInsideWalletBrowser,
        expected: { kind: 'wallet-connect' }
    },
    {
        name: 'a list of bridges',
        source: [{ bridgeUrl: 'https://a' }, { bridgeUrl: 'https://b' }],
        isInsideWalletBrowser: notInsideWalletBrowser,
        expected: { kind: 'http-any-wallet' }
    },
    {
        // Degenerate but reachable: the universal modal builds this list from the wallets it has,
        // and a filtered-down list can be empty.
        name: 'an empty list of bridges',
        source: [],
        isInsideWalletBrowser: notInsideWalletBrowser,
        expected: { kind: 'http-any-wallet' }
    },
    {
        // The two JS-bridge cases are structurally identical — only the predicate separates
        // them, which is why both branches are pinned here.
        name: 'a JS bridge outside the wallet browser',
        source: { jsBridgeKey: 'tonkeeper' },
        isInsideWalletBrowser: notInsideWalletBrowser,
        expected: { kind: 'js-injected', jsBridgeKey: 'tonkeeper' }
    },
    {
        name: 'a JS bridge inside the wallet browser',
        source: { jsBridgeKey: 'tonkeeper' },
        isInsideWalletBrowser: insideWalletBrowser,
        expected: { kind: 'js-embedded', jsBridgeKey: 'tonkeeper' }
    }
])(
    'models/wallet-connection-source: describeWalletConnectionSource',
    ({ name, source, isInsideWalletBrowser, expected }) => {
        it(`describes ${name} as "${expected.kind}"`, () => {
            const result = describeWalletConnectionSource(source, isInsideWalletBrowser);
            expect(result).toEqual(expected as WalletConnectionSourceInfo);
        });
    }
);

describe('models/wallet-connection-source: describeWalletConnectionSource', () => {
    it('consults the wallet-browser predicate only for JS bridge sources', () => {
        const calls: string[] = [];
        const record = (key: string): boolean => {
            calls.push(key);
            return false;
        };

        describeWalletConnectionSource(
            { universalLink: 'https://u', bridgeUrl: 'https://b' },
            record
        );
        describeWalletConnectionSource([{ bridgeUrl: 'https://b' }], record);
        describeWalletConnectionSource({ type: 'wallet-connect' }, record);
        expect(calls).toEqual([]);

        describeWalletConnectionSource({ jsBridgeKey: 'tonkeeper' }, record);
        expect(calls).toEqual(['tonkeeper']);
    });
});
