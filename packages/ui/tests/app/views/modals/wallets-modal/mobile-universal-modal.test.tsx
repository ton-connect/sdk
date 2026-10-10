// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { MobileUniversalModal } from 'src/app/views/modals/wallets-modal/mobile-universal-modal';
import { redirectToWallet } from 'src/app/utils/url-strategy-helpers';
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
    vi.clearAllMocks();
});

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
