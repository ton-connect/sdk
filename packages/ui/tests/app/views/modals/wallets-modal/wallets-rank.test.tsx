// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { MobileUniversalModal } from 'src/app/views/modals/wallets-modal/mobile-universal-modal';
import { DesktopUniversalModal } from 'src/app/views/modals/wallets-modal/desktop-universal-modal';
import { AllWalletsListModal } from 'src/app/views/modals/wallets-modal/all-wallets-list-modal';
import { WalletsModal } from 'src/app/views/modals/wallets-modal/wallets-modal';
import { lastVisibleWalletsInfo, setWalletsModalState } from 'src/app/state/modals-state';
import { updateIsMobile } from 'src/app/hooks/isMobile';
import { TonConnectUiContext } from 'src/app/state/ton-connect-ui.context';
import { UIWalletInfo } from 'src/app/models/ui-wallet-info';
import { TonConnectUI } from 'src/ton-connect-ui';
import { setAppState } from 'src/app/state/app.state';
import { mountModal, OPENED, remoteWallet } from './harness';

/**
 * A rank is the place a wallet asks for in the list each screen shows, so it is applied after the
 * screen has left out the wallets it does not list. Wallets sharing a rank are shuffled once per
 * opening of the modal, and every screen keeps that order until it closes.
 */
let dispose: (() => void) | undefined;
afterEach(() => {
    dispose?.();
    dispose = undefined;
    vi.restoreAllMocks();
});

function wallet(appName: string, rank?: number): UIWalletInfo {
    return {
        ...remoteWallet(appName, ['ios', 'android', 'macos']),
        imageUrl: `${appName}.png`,
        ...(rank === undefined ? {} : { rank }),
        isSupportRequiredFeatures: true
    };
}

function tileNames(root: ParentNode): string[] {
    return Array.from(root.querySelectorAll('[data-tc-wallet-item="true"]')).map(
        tile => tile.textContent ?? ''
    );
}

/** Icons on the View all tile, which is the last one. */
function viewAllIcons(root: ParentNode): string[] {
    const tiles = root.querySelectorAll('[data-tc-wallet-item="true"]');
    return Array.from(tiles[tiles.length - 1]!.querySelectorAll('img')).map(
        img => img.getAttribute('src') ?? ''
    );
}

/** Images show once loaded, which jsdom never does on its own. */
function loadImagesAtOnce(): void {
    vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(true);
}

describe('views/wallets-modal: rank on the mobile wallets screen', () => {
    function mountMobile(walletsList: UIWalletInfo[]): HTMLElement {
        const h = mountModal(() => (
            <MobileUniversalModal
                walletsList={walletsList}
                additionalRequest={{}}
                walletModalState={OPENED}
                onSelect={() => {}}
                onSelectAllWallets={() => {}}
            />
        ));
        dispose = h.dispose;
        return h.root;
    }

    it('places the row tiles by rank, counting places in the row below "Connect Telegram"', () => {
        const root = mountMobile([
            wallet('telegram'),
            wallet('a'),
            wallet('b'),
            wallet('c'),
            wallet('tonkeeper', 3),
            wallet('mytonwallet', 1)
        ]);

        expect(tileNames(root)).toEqual(['mytonwallet', 'a', 'tonkeeper', 'b', 'c']);
    });

    it('shows the wallets that follow the row tiles in rank order behind View all', () => {
        loadImagesAtOnce();
        const telegram = wallet('telegram');
        const [a, b, c, d, e, f, g] = ['a', 'b', 'c', 'd', 'e', 'f', 'g'].map(name => wallet(name));
        const mytonwallet = wallet('mytonwallet', 1);
        const tonkeeper = wallet('tonkeeper', 5);
        const root = mountMobile([telegram, a!, b!, c!, d!, e!, f!, g!, tonkeeper, mytonwallet]);

        expect(tileNames(root)).toEqual(['mytonwallet', 'a', 'b', 'View allwallets']);
        expect(viewAllIcons(root)).toEqual(['c.png', 'tonkeeper.png', 'd.png', 'e.png']);
        expect(lastVisibleWalletsInfo().wallets).toEqual([telegram, mytonwallet, a, b]);
    });

    it('previews behind View all what All Wallets lists next: supported wallets, then the rest', () => {
        loadImagesAtOnce();
        const [a, b, c, d, e, f, g] = ['a', 'b', 'c', 'd', 'e', 'f', 'g'].map(name => wallet(name));
        const unsupported = { ...wallet('unsupported'), isSupportRequiredFeatures: false };
        const ranked = wallet('ranked', 5);
        const root = mountMobile([a!, b!, c!, unsupported, d!, e!, f!, g!, ranked]);

        expect(tileNames(root)).toEqual(['a', 'b', 'c', 'View allwallets']);
        expect(viewAllIcons(root)).toEqual(['d.png', 'ranked.png', 'e.png', 'f.png']);
    });

    it('ranks only the wallets the row shows', () => {
        const root = mountMobile([
            wallet('a'),
            { ...wallet('b', 1), isSupportRequiredFeatures: false },
            wallet('c'),
            wallet('d', 2)
        ]);

        expect(tileNames(root)).toEqual(['a', 'd', 'c']);
    });
});

describe('views/wallets-modal: rank on the desktop wallets screen', () => {
    it('places the available wallets and those behind View all by rank', () => {
        loadImagesAtOnce();
        const h = mountModal(() => (
            <DesktopUniversalModal
                walletsList={[
                    wallet('a'),
                    wallet('b'),
                    wallet('c'),
                    wallet('d'),
                    wallet('e'),
                    wallet('tonkeeper', 4),
                    wallet('mytonwallet', 1)
                ]}
                additionalRequest={{}}
                walletModalState={OPENED}
                onSelect={() => {}}
                onSelectAllWallets={() => {}}
            />
        ));
        dispose = h.dispose;

        expect(tileNames(h.root)).toEqual(['mytonwallet', 'a', 'b', 'View allwallets']);
        expect(viewAllIcons(h.root)).toEqual(['tonkeeper.png', 'c.png', 'd.png', 'e.png']);
    });

    it('previews behind View all what All Wallets lists next: supported wallets, then the rest', () => {
        loadImagesAtOnce();
        const unsupported = { ...wallet('unsupported'), isSupportRequiredFeatures: false };
        const h = mountModal(() => (
            <DesktopUniversalModal
                walletsList={[
                    wallet('a'),
                    wallet('b'),
                    wallet('c'),
                    unsupported,
                    wallet('d'),
                    wallet('e'),
                    wallet('f'),
                    wallet('ranked', 5)
                ]}
                additionalRequest={{}}
                walletModalState={OPENED}
                onSelect={() => {}}
                onSelectAllWallets={() => {}}
            />
        ));
        dispose = h.dispose;

        expect(viewAllIcons(h.root)).toEqual(['d.png', 'ranked.png', 'e.png', 'f.png']);
    });
});

describe('views/wallets-modal: rank on the All Wallets screen', () => {
    it('places the supported and the unsupported wallets by rank, each in its own list', () => {
        const unsupported = (appName: string, rank?: number): UIWalletInfo => ({
            ...wallet(appName, rank),
            isSupportRequiredFeatures: false
        });
        const h = mountModal(() => (
            <AllWalletsListModal
                walletsList={[
                    wallet('a'),
                    unsupported('x'),
                    wallet('b'),
                    unsupported('y'),
                    unsupported('z', 1),
                    wallet('c', 2)
                ]}
                featureCheckMode="soft"
                onBack={() => {}}
                onSelect={() => {}}
            />
        ));
        dispose = h.dispose;

        const [supportedList, unsupportedList] = Array.from(h.root.querySelectorAll('ul'));
        expect(tileNames(supportedList!)).toEqual(['a', 'c', 'b']);
        expect(tileNames(unsupportedList!)).toEqual(['z', 'x', 'y']);
    });
});

describe('views/wallets-modal: wallets sharing a rank', () => {
    const registry = [
        wallet('a'),
        wallet('tonkeeper', 2),
        wallet('mytonwallet', 2),
        ...['b', 'c', 'd', 'e', 'f'].map(name => wallet(name))
    ];

    async function settle(): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 0));
    }

    async function open(): Promise<void> {
        setWalletsModalState(OPENED);
        await settle();
    }

    async function close(): Promise<void> {
        setWalletsModalState({ status: 'closed', closeReason: 'action-cancelled' });
        await settle();
    }

    function mountWalletsModal(): HTMLElement {
        const tonConnectUI = {
            getWallets: async () => registry,
            closeModal: () => {}
        } as unknown as TonConnectUI;
        const h = mountModal(() => (
            <TonConnectUiContext.Provider value={tonConnectUI}>
                <WalletsModal />
            </TonConnectUiContext.Provider>
        ));
        dispose = h.dispose;
        return h.root;
    }

    function clickTile(root: HTMLElement, name: string): void {
        const tile = Array.from(
            root.querySelectorAll<HTMLElement>('[data-tc-wallet-item="true"]')
        ).find(candidate => candidate.textContent === name);
        tile!.click();
    }

    const desktopWidth = window.innerWidth;
    afterEach(async () => {
        await close();
        window.innerWidth = desktopWidth;
        updateIsMobile();
    });

    it('draws their order once per opening and keeps it on every screen', async () => {
        window.innerWidth = 390;
        const random = vi.spyOn(Math, 'random').mockReturnValue(0.2);
        const root = mountWalletsModal();

        await open();
        expect(tileNames(root)).toEqual(['a', 'mytonwallet', 'tonkeeper', 'View allwallets']);

        // Nothing is drawn again while the modal stays open, not even when a uiOptions update
        // hands the wallets list a new configuration object and the list is rebuilt.
        random.mockReturnValue(0.8);
        setAppState({ walletsListConfiguration: {} });
        expect(tileNames(root)).toEqual(['a', 'mytonwallet', 'tonkeeper', 'View allwallets']);
        clickTile(root, 'View allwallets');
        expect(tileNames(root).slice(0, 4)).toEqual(['a', 'mytonwallet', 'tonkeeper', 'b']);
        root.querySelector<HTMLElement>(
            '[data-tc-wallets-modal-list="true"] [data-tc-icon-button="true"]'
        )!.click();
        expect(tileNames(root)).toEqual(['a', 'mytonwallet', 'tonkeeper', 'View allwallets']);

        await close();
        await open();
        expect(tileNames(root)).toEqual(['a', 'tonkeeper', 'mytonwallet', 'View allwallets']);
    });

    it('draws includeWallets entries together with the registry wallets sharing their rank', async () => {
        window.innerWidth = 390;
        // With every draw at 0.2, the last of the three rank 2 wallets comes out second.
        vi.spyOn(Math, 'random').mockReturnValue(0.2);
        setAppState({
            walletsListConfiguration: {
                includeWallets: [{ ...remoteWallet('custom', ['ios', 'android']), rank: 2 }]
            }
        });
        try {
            const root = mountWalletsModal();

            await open();
            expect(tileNames(root)).toEqual(['a', 'mytonwallet', 'custom', 'View allwallets']);
        } finally {
            setAppState({ walletsListConfiguration: {} });
        }
    });
});
