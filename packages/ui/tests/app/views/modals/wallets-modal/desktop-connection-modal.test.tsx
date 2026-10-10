// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { DesktopConnectionModal } from 'src/app/views/modals/wallets-modal/desktop-connection-modal';
import { redirectToWallet } from 'src/app/utils/url-strategy-helpers';
import { clickButton, mountModal, OPENED, remoteWallet } from './harness';

vi.mock('src/app/utils/url-strategy-helpers', async importOriginal => ({
    ...(await importOriginal<object>()),
    redirectToWallet: vi.fn(),
    redirectToTelegram: vi.fn()
}));

/**
 * The mount-time dispatch reuses the footer handlers, and three of its branches differ in what
 * they commit to: a QR is shown and nothing is chosen, an installed extension is connected to,
 * a desktop app is opened. Only the last two are selections, and a selection the modal makes
 * for the user has to carry the source of the preselection it completes.
 */
let dispose: (() => void) | undefined;
afterEach(() => {
    dispose?.();
    vi.clearAllMocks();
});

describe('views/desktop-connection-modal: mount', () => {
    it('records the selection for an installed extension-only wallet, before connecting', () => {
        const wallet = remoteWallet('openmask', ['chrome'], {
            jsBridgeKey: 'openmask',
            injected: true
        });
        const h = mountModal(() => (
            <DesktopConnectionModal
                wallet={wallet}
                walletsModalState={OPENED}
                selectionSource="manual"
                onBackClick={() => {}}
            />
        ));
        dispose = h.dispose;

        expect(h.trackWalletSelected.mock.calls).toEqual([
            ['openmask', 'connection-modal', 'manual', 'trace-1', 'extension']
        ]);
        expect(h.connect).toHaveBeenCalledTimes(1);
        expect(h.connect.mock.calls[0]![0]).toEqual({ jsBridgeKey: 'openmask' });
        expect(h.trackWalletSelected.mock.invocationCallOrder[0]).toBeLessThan(
            h.connect.mock.invocationCallOrder[0]!
        );
    });

    it('records nothing for an extension-only wallet that is not installed', () => {
        const wallet = remoteWallet('openmask', ['chrome'], {
            jsBridgeKey: 'openmask',
            injected: false
        });
        const h = mountModal(() => (
            <DesktopConnectionModal
                wallet={wallet}
                walletsModalState={OPENED}
                selectionSource="manual"
                onBackClick={() => {}}
            />
        ));
        dispose = h.dispose;

        expect(h.trackWalletSelected).not.toHaveBeenCalled();
        expect(h.connect).not.toHaveBeenCalled();
    });

    it('carries the dApp-directed source when the single-wallet flow mounts it', () => {
        const wallet = remoteWallet('openmask', ['chrome'], {
            jsBridgeKey: 'openmask',
            injected: true
        });
        const h = mountModal(() => (
            <DesktopConnectionModal
                wallet={wallet}
                walletsModalState={OPENED}
                selectionSource="auto-dapp-directed"
                onBackClick={() => {}}
                backDisabled={true}
            />
        ));
        dispose = h.dispose;

        expect(h.trackWalletSelected.mock.calls).toEqual([
            ['openmask', 'connection-modal', 'auto-dapp-directed', 'trace-1', 'extension']
        ]);
    });

    it('records the selection for a desktop-only wallet it redirects to', () => {
        const wallet = remoteWallet('tonkeeper-pro', ['macos', 'windows', 'linux']);
        const h = mountModal(() => (
            <DesktopConnectionModal
                wallet={wallet}
                walletsModalState={OPENED}
                selectionSource="manual"
                onBackClick={() => {}}
            />
        ));
        dispose = h.dispose;

        expect(h.trackWalletSelected.mock.calls).toEqual([
            ['tonkeeper-pro', 'connection-modal', 'manual', 'trace-1', 'desktop']
        ]);
        expect(redirectToWallet).toHaveBeenCalledTimes(1);
    });

    it('records nothing for a wallet whose mount only shows a QR', () => {
        const wallet = remoteWallet('tonkeeper', ['ios', 'android', 'chrome'], {
            jsBridgeKey: 'tonkeeper',
            injected: true
        });
        const h = mountModal(() => (
            <DesktopConnectionModal
                wallet={wallet}
                walletsModalState={OPENED}
                selectionSource="manual"
                onBackClick={() => {}}
            />
        ));
        dispose = h.dispose;

        expect(h.trackWalletSelected).not.toHaveBeenCalled();
        expect(h.connect).toHaveBeenCalledTimes(1);
        expect(h.connect.mock.calls[0]![2]).toMatchObject({ linkDisplayOnly: true });
    });
});

describe('views/desktop-connection-modal: footer', () => {
    it('reports a footer click as manual whatever the preselection source was', () => {
        const wallet = remoteWallet('tonkeeper', ['ios', 'android', 'chrome'], {
            jsBridgeKey: 'tonkeeper',
            injected: true
        });
        const h = mountModal(() => (
            <DesktopConnectionModal
                wallet={wallet}
                walletsModalState={OPENED}
                selectionSource="auto-dapp-directed"
                onBackClick={() => {}}
            />
        ));
        dispose = h.dispose;

        clickButton(h.root, 'Browser Extension');

        expect(h.trackWalletSelected.mock.calls).toEqual([
            ['tonkeeper', 'connection-modal', 'manual', 'trace-1', 'extension']
        ]);
    });
});
