import { WalletInfo, TonConnect, isWalletInfoCurrentlyInjected } from '@tonconnect/sdk';
import { UIWallet } from 'src/models/ui-wallet';
import { WalletsListConfiguration } from 'src/models';
import { mergeConcat } from 'src/app/utils/array';

export function uiWalletToWalletInfo(uiWallet: UIWallet): WalletInfo {
    if ('jsBridgeKey' in uiWallet) {
        return {
            ...uiWallet,
            injected: TonConnect.isWalletInjected(uiWallet.jsBridgeKey),
            embedded: TonConnect.isInsideWalletBrowser(uiWallet.jsBridgeKey)
        };
    }

    return uiWallet;
}

export function applyWalletsListConfiguration(
    walletsList: WalletInfo[],
    configuration?: WalletsListConfiguration
): WalletInfo[] {
    if (!configuration) {
        return walletsList;
    }

    if (configuration.includeWallets?.length) {
        walletsList = mergeConcat(
            'name',
            walletsList,
            configuration.includeWallets.map(uiWalletToWalletInfo)
        );
    }

    return walletsList;
}

export function supportsDesktop(walletInfo: WalletInfo): boolean {
    return walletInfo.platforms.some(w => ['macos', 'linux', 'windows'].includes(w));
}

export function supportsMobile(walletInfo: WalletInfo): boolean {
    return walletInfo.platforms.some(w => ['ios', 'android'].includes(w));
}

export function supportsExtension(walletInfo: WalletInfo): boolean {
    return walletInfo.platforms.some(w => ['chrome', 'firefox', 'safari'].includes(w));
}

export function eqWalletName(wallet1: { name: string; appName: string }, name?: string): boolean {
    if (!name) {
        return false;
    }

    return (
        wallet1.name.toLowerCase() === name.toLowerCase() ||
        wallet1.appName.toLowerCase() === name.toLowerCase()
    );
}

/**
 * The wallet tile fits one line of name and keeps its second line for labels such as "Recent", so
 * a trailing bracketed note such as "(ex. Wallet)" is dropped from the name the tile shows. Labels
 * that put the name inside a phrase, such as "Open Walt Desktop", drop it too.
 */
export function stripWalletNameNote(name: string): string {
    const match = /^(.+?)\s*\([^()]+\)$/.exec(name);
    return match?.[1] ?? name;
}

/** The wallet's rank, or null when it has none: wallets from includeWallets skip the SDK's check. */
function getWalletRank(wallet: { rank?: number }): number | null {
    const rank = wallet.rank;
    return typeof rank === 'number' && Number.isInteger(rank) && rank >= 1 ? rank : null;
}

/**
 * Puts the wallets that share a rank in a random order among the places they hold, leaving every
 * other wallet where it is. Of two such wallets, the second comes first when `random()` is below
 * 0.5, and any number of them is shuffled fairly.
 */
export function shuffleRankTies<T extends { rank?: number }>(
    wallets: readonly T[],
    random: () => number = Math.random
): T[] {
    const placesByRank = new Map<number, number[]>();
    wallets.forEach((wallet, place) => {
        const rank = getWalletRank(wallet);
        if (rank !== null) {
            placesByRank.set(rank, (placesByRank.get(rank) ?? []).concat(place));
        }
    });

    const shuffled = wallets.slice();
    placesByRank.forEach(places => {
        for (let i = places.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            const [a, b] = [places[i]!, places[j]!];
            [shuffled[a], shuffled[b]] = [shuffled[b]!, shuffled[a]!];
        }
    });

    return shuffled;
}

/**
 * Orders the wallets a screen lists by their registry rank, the 1-based place each asks for in
 * that list. The wallets the modal pins to the front, the "Recent" one and those injected into
 * the page, keep their places there. A wallet whose place is taken gets the next free one, so
 * wallets sharing a rank follow each other in their incoming order, and wallets without a rank
 * fill the free places in theirs. Without ranks, the order is left as it is.
 */
export function orderWalletsByRank<T extends WalletInfo & { isPreferred?: boolean }>(
    wallets: readonly T[]
): T[] {
    const firstUnpinned = wallets.findIndex(
        wallet => !wallet.isPreferred && !isWalletInfoCurrentlyInjected(wallet)
    );
    const pinnedCount = firstUnpinned === -1 ? wallets.length : firstUnpinned;
    const others = wallets.slice(pinnedCount);

    const ranked = others
        .filter(wallet => getWalletRank(wallet) !== null)
        .sort((a, b) => getWalletRank(a)! - getWalletRank(b)!);
    if (!ranked.length) {
        return wallets.slice();
    }
    const unranked = others.filter(wallet => getWalletRank(wallet) === null);

    const ordered = wallets.slice(0, pinnedCount);
    let nextRanked = 0;
    let nextUnranked = 0;
    while (ordered.length < wallets.length) {
        const rankedWallet = ranked[nextRanked];
        const isRankedWalletDue =
            !!rankedWallet &&
            (getWalletRank(rankedWallet)! <= ordered.length + 1 ||
                nextUnranked === unranked.length);
        ordered.push(isRankedWalletDue ? ranked[nextRanked++]! : unranked[nextUnranked++]!);
    }

    return ordered;
}
