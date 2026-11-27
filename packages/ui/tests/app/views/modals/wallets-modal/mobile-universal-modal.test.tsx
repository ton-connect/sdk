// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { MobileUniversalModal } from 'src/app/views/modals/wallets-modal/mobile-universal-modal';
import { redirectToWallet } from 'src/app/utils/url-strategy-helpers';
import { lastVisibleWalletsInfo } from 'src/app/state/modals-state';
import { setAppState } from 'src/app/state/app.state';
import { UIWalletInfo } from 'src/app/models/ui-wallet-info';
import { clickButton, mountModal, OPENED, remoteWallet, Recorders } from './harness';

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
    setAppState({ withSecondaryButton: false });
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

describe('views/mobile-universal-modal: promoted wallets', () => {
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
