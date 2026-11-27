import { describe, it, expect } from 'vitest';
import { WalletInfoRemote } from '@tonconnect/sdk';
import { orderWalletsByRank, shuffleRankTies, stripWalletNameNote } from 'src/app/utils/wallets';

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

type TestWallet = WalletInfoRemote & { isPreferred?: boolean; injected?: boolean };

/** A wallet per `name` or `name:rank`, e.g. `wallets('a', 'b:3')`. */
function wallets(...specs: string[]): TestWallet[] {
    return specs.map(spec => {
        const [name, rank] = spec.split(':');
        return {
            name: name!,
            appName: name!,
            imageUrl: '',
            aboutUrl: '',
            platforms: ['ios', 'android'],
            universalLink: `https://${name}.example/ton-connect`,
            bridgeUrl: `https://${name}.example/bridge`,
            ...(rank === undefined ? {} : { rank: Number(rank) })
        };
    });
}

function names(list: { name: string }[]): string[] {
    return list.map(wallet => wallet.name);
}

describe('app/utils/wallets: orderWalletsByRank', () => {
    it('keeps the incoming order when no wallet has a rank', () => {
        const list = wallets('a', 'b', 'c', 'd');

        const ordered = orderWalletsByRank(list);

        expect(ordered).toEqual(list);
        expect(ordered).not.toBe(list);
    });

    it('puts a rank 1 wallet first', () => {
        expect(names(orderWalletsByRank(wallets('a', 'b', 'c', 'd:1')))).toEqual([
            'd',
            'a',
            'b',
            'c'
        ]);
    });

    it('puts a wallet at the place its rank names, others filling the free places in order', () => {
        expect(names(orderWalletsByRank(wallets('a:5', 'b', 'c', 'd:3', 'e', 'f')))).toEqual([
            'b',
            'c',
            'd',
            'e',
            'a',
            'f'
        ]);
    });

    it('lays wallets sharing a rank side by side in their incoming order', () => {
        expect(names(orderWalletsByRank(wallets('a', 'b:3', 'c', 'd', 'e:3', 'f')))).toEqual([
            'a',
            'c',
            'b',
            'e',
            'd',
            'f'
        ]);
    });

    it('moves a wallet whose place is taken to the next free one', () => {
        expect(names(orderWalletsByRank(wallets('a', 'b:2', 'c:1', 'd:1', 'e')))).toEqual([
            'c',
            'd',
            'b',
            'a',
            'e'
        ]);
    });

    it('puts wallets ranked past the end last, in rank order', () => {
        expect(names(orderWalletsByRank(wallets('a:9', 'b', 'c:20', 'd:3', 'e')))).toEqual([
            'b',
            'e',
            'd',
            'a',
            'c'
        ]);
        expect(names(orderWalletsByRank(wallets('a:3', 'b:3', 'c')))).toEqual(['c', 'a', 'b']);
    });

    it('keeps the "Recent" and injected wallets ahead of the ranked ones', () => {
        const [recent, injected, ...others] = wallets('recent:4', 'injected', 'a', 'b', 'c:1');
        const list = [
            { ...recent!, isPreferred: true },
            { ...injected!, jsBridgeKey: 'injected', injected: true, embedded: false },
            ...others
        ];

        expect(names(orderWalletsByRank(list))).toEqual(['recent', 'injected', 'c', 'a', 'b']);
        expect(names(orderWalletsByRank(wallets('a', 'b', 'c', 'd:3')))).toEqual([
            'a',
            'b',
            'd',
            'c'
        ]);
        expect(names(orderWalletsByRank([list[0]!, ...wallets('a', 'b', 'd:3')]))).toEqual([
            'recent',
            'a',
            'd',
            'b'
        ]);
    });

    it('ignores ranks that are not positive integers', () => {
        const list = wallets('a', 'b:0', 'c:-1', 'd:1.5', 'e:NaN');

        expect(orderWalletsByRank(list)).toEqual(list);
    });
});

describe('app/utils/wallets: shuffleRankTies', () => {
    /** Returns the given draws in turn. */
    function draws(...values: number[]): () => number {
        return () => values.shift()!;
    }

    it('swaps two wallets sharing a rank when the draw is below 0.5', () => {
        const list = wallets('a', 'b:3', 'c', 'd:3', 'e:4');

        expect(names(shuffleRankTies(list, draws(0.49)))).toEqual(['a', 'd', 'c', 'b', 'e']);
        expect(names(shuffleRankTies(list, draws(0.5)))).toEqual(['a', 'b', 'c', 'd', 'e']);
        expect(names(list)).toEqual(['a', 'b', 'c', 'd', 'e']);
    });

    it('does not draw for wallets without a rank or alone at theirs', () => {
        let drawn = 0;
        const list = wallets('a', 'b:1', 'c:2', 'd');

        expect(
            shuffleRankTies(list, () => {
                drawn++;
                return 0;
            })
        ).toEqual(list);
        expect(drawn).toBe(0);
    });

    it('reaches every order of three wallets sharing a rank, one per pair of draws', () => {
        const list = wallets('x', 'a:2', 'b:2', 'c:2');
        const orders = new Set<string>();

        for (const first of [0, 0.4, 0.7]) {
            for (const second of [0, 0.6]) {
                const shuffled = shuffleRankTies(list, draws(first, second));
                expect(shuffled[0]).toBe(list[0]);
                orders.add(names(shuffled).join(''));
            }
        }

        expect([...orders].sort()).toEqual(['xabc', 'xacb', 'xbac', 'xbca', 'xcab', 'xcba']);
    });

    it('feeds orderWalletsByRank, which keeps the shuffled order of a tie', () => {
        const list = wallets('a', 'b', 'tonkeeper:3', 'mytonwallet:3', 'c');

        expect(names(orderWalletsByRank(shuffleRankTies(list, draws(0.2))))).toEqual([
            'a',
            'b',
            'mytonwallet',
            'tonkeeper',
            'c'
        ]);
        expect(names(orderWalletsByRank(shuffleRankTies(list, draws(0.8))))).toEqual([
            'a',
            'b',
            'tonkeeper',
            'mytonwallet',
            'c'
        ]);
    });
});
