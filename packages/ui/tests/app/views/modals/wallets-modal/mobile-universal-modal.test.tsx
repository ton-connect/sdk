// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { MobileUniversalModal } from 'src/app/views/modals/wallets-modal/mobile-universal-modal';
import { redirectToWallet } from 'src/app/utils/url-strategy-helpers';
import { lastVisibleWalletsInfo, setWalletsModalState } from 'src/app/state/modals-state';
import { setAppState } from 'src/app/state/app.state';
import { WalletsModal } from 'src/app/views/modals/wallets-modal/wallets-modal';
import { TonConnectUiContext } from 'src/app/state/ton-connect-ui.context';
import { updateIsMobile } from 'src/app/hooks/isMobile';
import { TonConnectUI } from 'src/ton-connect-ui';
import { UIWalletInfo } from 'src/app/models/ui-wallet-info';
import {
    clickButton,
    mountModal,
    OPENED,
    remoteWallet,
    Recorders,
    shareOneStyleSheet
} from './harness';

shareOneStyleSheet();

vi.mock('src/app/utils/url-strategy-helpers', async importOriginal => ({
    ...(await importOriginal<object>()),
    redirectToWallet: vi.fn(),
    redirectToTelegram: vi.fn()
}));

vi.mock('src/app/utils/copy-to-clipboard', () => ({
    copyToClipboard: vi.fn(async () => {})
}));

/**
 * One cached link serves the QR, Copy Link and Open Link, and only the first of them can fill
 * the cache, because the other two are buttons on the QR screen. So the `connect()` that fills
 * it is always display-only, and the initiation has to be reported when the link is opened.
 */
let dispose: (() => void) | undefined;
afterEach(() => {
    dispose?.();
    setAppState({ withSecondaryButton: false, isCompact: false });
    vi.clearAllMocks();
});

function supported(appName: string): UIWalletInfo {
    return { ...remoteWallet(appName, ['ios', 'android']), isSupportRequiredFeatures: true };
}

function mountList(walletsList: UIWalletInfo[]): HTMLElement {
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

function rowTileNames(root: HTMLElement): string[] {
    return Array.from(root.querySelectorAll('[data-tc-wallet-item="true"]')).map(
        tile => tile.textContent ?? ''
    );
}

/** Labels of the full-width buttons above the row, leaving out the tiles, which are buttons too. */
function buttonLabels(root: HTMLElement): string[] {
    return Array.from(root.querySelectorAll('button[data-tc-button="true"]')).map(
        button => button.textContent ?? ''
    );
}

function mount(): Recorders & { root: HTMLElement } {
    const walletsList = [
        { ...remoteWallet('tonkeeper', ['ios', 'android']), isSupportRequiredFeatures: true },
        { ...remoteWallet('mytonwallet', ['ios', 'android']), isSupportRequiredFeatures: true }
    ];
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
    return h;
}

function openQR(root: HTMLElement): void {
    root.querySelector<HTMLElement>('[data-tc-icon-button="true"]')!.click();
}

describe('views/mobile-universal-modal: universal link', () => {
    it('builds the QR link as display-only', () => {
        const h = mount();
        expect(h.connect).not.toHaveBeenCalled();

        openQR(h.root);

        expect(h.connect).toHaveBeenCalledTimes(1);
        expect(h.connect.mock.calls[0]![2]).toMatchObject({
            traceId: 'trace-1',
            linkDisplayOnly: true
        });
        expect(h.trackConnectionInitiated).not.toHaveBeenCalled();
    });

    it('reports opening the shown link as the initiation, without a second connect', () => {
        const h = mount();
        openQR(h.root);

        clickButton(h.root, 'Open Link');

        expect(h.trackConnectionInitiated.mock.calls).toEqual([
            [{ kind: 'http-any-wallet' }, 'trace-1']
        ]);
        expect(h.connect).toHaveBeenCalledTimes(1);
        expect(redirectToWallet).toHaveBeenCalledTimes(1);
    });

    it('does not report copying the link as an initiation', () => {
        const h = mount();
        openQR(h.root);

        clickButton(h.root, 'Copy Link');

        expect(h.trackConnectionInitiated).not.toHaveBeenCalled();
        expect(h.connect).toHaveBeenCalledTimes(1);
    });
});

describe('views/mobile-universal-modal: Telegram and Gram Wallet', () => {
    it.each([
        ['telegram', 'Connect Telegram'],
        ['gramwallet', 'gramwallet']
    ])('routes the %s button through onSelect alone', (appName, label) => {
        setAppState({ withSecondaryButton: true });
        const onSelect = vi.fn();
        const promoted = {
            ...remoteWallet(appName, ['ios', 'android']),
            isSupportRequiredFeatures: true
        };
        const other = {
            ...remoteWallet('tonkeeper', ['ios', 'android']),
            isSupportRequiredFeatures: true
        };
        const h = mountModal(() => (
            <MobileUniversalModal
                walletsList={[promoted, other]}
                additionalRequest={{}}
                walletModalState={OPENED}
                onSelect={onSelect}
                onSelectAllWallets={() => {}}
            />
        ));
        dispose = h.dispose;

        clickButton(h.root, label);

        expect(onSelect.mock.calls).toEqual([[promoted]]);
        expect(h.connect).not.toHaveBeenCalled();
        expect(h.trackWalletSelected).not.toHaveBeenCalled();
        expect(h.trackConnectionInitiated).not.toHaveBeenCalled();
    });
});

describe('views/mobile-universal-modal: Gram Wallet placement', () => {
    const walletsList = (): UIWalletInfo[] =>
        ['telegram', 'gramwallet', 'telegram-wallet', 'tonkeeper'].map(supported);

    it('lists Gram Wallet in the row at its place in the list by default', () => {
        const root = mountList(walletsList());

        expect(rowTileNames(root)).toEqual(['gramwallet', 'telegram-wallet', 'tonkeeper']);
        expect(buttonLabels(root)).not.toContain('gramwallet');
    });

    it('gives Gram Wallet its own button, out of the row, with withSecondaryButton', () => {
        setAppState({ withSecondaryButton: true });
        const root = mountList(walletsList());

        expect(buttonLabels(root)).toContain('gramwallet');
        expect(rowTileNames(root)).toEqual(['telegram-wallet', 'tonkeeper']);
    });

    it('follows the option while the screen is open', () => {
        const root = mountList(walletsList());

        setAppState({ withSecondaryButton: true });
        expect(buttonLabels(root)).toContain('gramwallet');
        expect(rowTileNames(root)).toEqual(['telegram-wallet', 'tonkeeper']);

        setAppState({ withSecondaryButton: false });
        expect(buttonLabels(root)).not.toContain('gramwallet');
        expect(rowTileNames(root)).toEqual(['gramwallet', 'telegram-wallet', 'tonkeeper']);
    });
});

describe('views/mobile-universal-modal: visible wallets', () => {
    it('reports the promoted buttons ahead of the row on the main screen', () => {
        setAppState({ withSecondaryButton: true });
        const [telegram, gram, tonkeeper, mytonwallet] = [
            'telegram',
            'gramwallet',
            'tonkeeper',
            'mytonwallet'
        ].map(appName => ({
            ...remoteWallet(appName, ['ios', 'android']),
            isSupportRequiredFeatures: true
        }));
        const h = mountModal(() => (
            <MobileUniversalModal
                walletsList={[tonkeeper!, telegram!, mytonwallet!, gram!]}
                additionalRequest={{}}
                walletModalState={OPENED}
                onSelect={() => {}}
                onSelectAllWallets={() => {}}
            />
        ));
        dispose = h.dispose;

        expect(lastVisibleWalletsInfo()).toEqual({
            walletsMenu: 'main_screen',
            wallets: [telegram, gram, tonkeeper, mytonwallet]
        });
    });

    it('reports Gram Wallet among the row tiles when it has no button of its own', () => {
        const [telegram, gram, tonkeeper, mytonwallet] = [
            'telegram',
            'gramwallet',
            'tonkeeper',
            'mytonwallet'
        ].map(supported);
        mountList([tonkeeper!, telegram!, mytonwallet!, gram!]);

        expect(lastVisibleWalletsInfo()).toEqual({
            walletsMenu: 'main_screen',
            wallets: [telegram, tonkeeper, mytonwallet, gram]
        });
    });

    it('does not report Gram Wallet when it is only behind the View all tile', () => {
        const telegram = supported('telegram');
        const others = ['a', 'b', 'c', 'gramwallet', 'd', 'e', 'f', 'g'].map(supported);
        const root = mountList([telegram, ...others]);

        expect(rowTileNames(root)).toEqual(['a', 'b', 'c', 'View allwallets']);
        expect(lastVisibleWalletsInfo()).toEqual({
            walletsMenu: 'main_screen',
            wallets: [telegram, ...others.slice(0, 3)]
        });
    });
});

describe('views/mobile-universal-modal: row heading', () => {
    it.each([
        ['the Telegram button is shown', true, false, 'Or choose another app:'],
        ['only the Gram Wallet button is shown', false, true, 'Or choose another app:'],
        ['Gram Wallet is only in the row', false, false, 'Choose an app:']
    ])('reads correctly when %s', (_, telegramSupported, withSecondaryButton, heading) => {
        setAppState({ withSecondaryButton });
        const walletsList = [
            {
                ...remoteWallet('telegram', ['ios', 'android']),
                isSupportRequiredFeatures: telegramSupported
            },
            { ...remoteWallet('gramwallet', ['ios', 'android']), isSupportRequiredFeatures: true },
            { ...remoteWallet('tonkeeper', ['ios', 'android']), isSupportRequiredFeatures: true }
        ];
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

        expect(h.root.querySelector('[data-tc-h2="true"]')?.textContent).toBe(heading);
    });
});

describe('views/mobile-universal-modal: compact row', () => {
    const [telegram, gram, tonkeeper, mytonwallet] = [
        'telegram',
        'gramwallet',
        'tonkeeper',
        'mytonwallet'
    ].map(supported);

    function toggle(root: HTMLElement): HTMLButtonElement | null {
        return root.querySelector<HTMLButtonElement>('[data-tc-wallets-row-toggle="true"]');
    }

    /** Whether the row is folded away: its tiles are then not in the document at all. */
    function isRowHidden(root: HTMLElement): boolean {
        return !root.querySelector('[data-tc-wallet-item="true"]');
    }

    it('shows the heading and the row unless the option is set', () => {
        const root = mountList([telegram!, tonkeeper!, mytonwallet!]);

        expect(toggle(root)).toBeNull();
        expect(root.querySelector('[data-tc-h2="true"]')?.textContent).toBe(
            'Or choose another app:'
        );
        expect(isRowHidden(root)).toBe(false);
    });

    it('folds the row behind a toggle that replaces the heading', () => {
        setAppState({ isCompact: true });
        const root = mountList([telegram!, tonkeeper!, mytonwallet!]);
        const button = toggle(root)!;

        expect(button.type).toBe('button');
        expect(button.textContent).toBe('Other wallets');
        expect(button.getAttribute('aria-expanded')).toBe('false');
        expect(root.querySelector('[data-tc-h2="true"]')).toBeNull();
        expect(isRowHidden(root)).toBe(true);
        expect(lastVisibleWalletsInfo()).toEqual({
            walletsMenu: 'main_screen',
            wallets: [telegram]
        });

        button.click();

        const row = document.getElementById(button.getAttribute('aria-controls')!)!;
        expect(row.querySelectorAll('[data-tc-wallet-item="true"]')).toHaveLength(2);
    });

    // The toggle previews what it unfolds: an icon per wallet, up to three, hidden from readers
    it('stacks the icons of the folded wallets on the toggle until they unfold', () => {
        setAppState({ isCompact: true });
        const root = mountList([telegram!, gram!, tonkeeper!, mytonwallet!]);
        const stack = toggle(root)!.querySelector('[aria-hidden="true"]')!;

        expect(stack.children).toHaveLength(3);
        expect(getComputedStyle(stack).opacity).toBe('1');

        toggle(root)!.click();

        expect(getComputedStyle(stack).opacity).toBe('0');
    });

    it('unfolds the row on click, and folds it back on the next one', async () => {
        setAppState({ isCompact: true });
        const root = mountList([telegram!, tonkeeper!, mytonwallet!]);

        toggle(root)!.click();

        expect(toggle(root)!.getAttribute('aria-expanded')).toBe('true');
        expect(isRowHidden(root)).toBe(false);
        expect(lastVisibleWalletsInfo()).toEqual({
            walletsMenu: 'main_screen',
            wallets: [telegram, tonkeeper, mytonwallet]
        });

        toggle(root)!.click();
        // The row leaves once its fold animation has finished
        await Promise.resolve();

        expect(toggle(root)!.getAttribute('aria-expanded')).toBe('false');
        expect(isRowHidden(root)).toBe(true);
        expect(lastVisibleWalletsInfo().wallets).toEqual([telegram]);
    });

    it('shows the row as usual when no button is shown above it', () => {
        setAppState({ isCompact: true });
        const root = mountList([
            { ...telegram!, isSupportRequiredFeatures: false },
            tonkeeper!,
            mytonwallet!
        ]);

        expect(toggle(root)).toBeNull();
        expect(root.querySelector('[data-tc-h2="true"]')?.textContent).toBe('Choose an app:');
        expect(isRowHidden(root)).toBe(false);
    });

    it('offers no toggle when the row has no tile to unfold', () => {
        setAppState({ isCompact: true });
        const root = mountList([telegram!, { ...tonkeeper!, isSupportRequiredFeatures: false }]);

        expect(toggle(root)).toBeNull();
    });

    it.each([false, true])(
        'reports every tile the row draws, with no View all tile (isCompact %s)',
        isCompact => {
            setAppState({ isCompact });
            const others = ['a', 'b', 'c', 'd', 'e'].map(supported);
            const root = mountList([telegram!, ...others]);

            toggle(root)?.click();

            expect(lastVisibleWalletsInfo().wallets).toEqual([telegram, ...others]);
        }
    );

    it('folds the row under the Gram Wallet button with withSecondaryButton', () => {
        setAppState({ isCompact: true, withSecondaryButton: true });
        const root = mountList([telegram!, gram!, tonkeeper!, mytonwallet!]);

        expect(buttonLabels(root)).toEqual(['Connect Telegram', 'gramwallet']);
        expect(toggle(root)!.getAttribute('aria-expanded')).toBe('false');
        expect(isRowHidden(root)).toBe(true);
        expect(lastVisibleWalletsInfo().wallets).toEqual([telegram, gram]);
    });
});

describe('views/mobile-universal-modal: compact row inside the modal', () => {
    const wallets = ['telegram', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(supported);
    const desktopWidth = window.innerWidth;

    async function settle(): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 0));
    }

    async function setOpened(opened: boolean): Promise<void> {
        setWalletsModalState(
            opened ? OPENED : { status: 'closed', closeReason: 'action-cancelled' }
        );
        await settle();
    }

    function toggle(root: HTMLElement): HTMLButtonElement {
        return root.querySelector<HTMLButtonElement>('[data-tc-wallets-row-toggle="true"]')!;
    }

    afterEach(async () => {
        await setOpened(false);
        window.innerWidth = desktopWidth;
        updateIsMobile();
    });

    it('keeps the row unfolded on the way back from All Wallets, until the modal closes', async () => {
        window.innerWidth = 390;
        setAppState({ isCompact: true });
        const tonConnectUI = {
            getWallets: async () => wallets,
            closeModal: () => {}
        } as unknown as TonConnectUI;
        const h = mountModal(() => (
            <TonConnectUiContext.Provider value={tonConnectUI}>
                <WalletsModal />
            </TonConnectUiContext.Provider>
        ));
        dispose = h.dispose;

        await setOpened(true);
        toggle(h.root).click();
        h.root
            .querySelector<HTMLElement>(
                '[data-tc-wallets-modal-universal-mobile="true"] li:last-child [data-tc-wallet-item="true"]'
            )!
            .click();
        h.root
            .querySelector<HTMLElement>(
                '[data-tc-wallets-modal-list="true"] [data-tc-icon-button="true"]'
            )!
            .click();

        expect(toggle(h.root).getAttribute('aria-expanded')).toBe('true');

        await setOpened(false);
        await setOpened(true);

        expect(toggle(h.root).getAttribute('aria-expanded')).toBe('false');
    });
});
