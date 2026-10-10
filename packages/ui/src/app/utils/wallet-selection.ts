import { WalletSelectionSource, WalletSelectionSurface } from '@tonconnect/sdk';
import { TonConnectUITracker } from 'src/tracker/ton-connect-ui-tracker';

/**
 * Records a wallet pick as either a preselection or a selection, according to how many decisions
 * the platform still has ahead of it.
 *
 * On mobile the connection modal redirects to the wallet on mount, so the pick is the
 * commitment. On desktop it opens a second screen offering QR, browser extension and desktop
 * app, so the pick only narrows the choice and the commitment — if the user makes one rather
 * than scanning the default QR — is recorded later by that screen's footer buttons.
 *
 * Shared by the modal and the single-wallet manager so the rule lives in one place, and so it
 * can be tested without a viewport: the browser automation used to verify these events pins
 * `window.innerWidth`, which is what `isMobile` derives from.
 */
export function trackWalletPick(
    tracker: TonConnectUITracker,
    options: {
        isMobile: boolean;
        walletAppName: string;
        surface: WalletSelectionSurface;
        selectionSource: WalletSelectionSource;
        traceId: string;
    }
): void {
    const { isMobile, walletAppName, surface, selectionSource, traceId } = options;

    if (isMobile) {
        tracker.trackWalletSelected(walletAppName, surface, selectionSource, traceId);
    } else {
        tracker.trackWalletPreselected(walletAppName, surface, selectionSource, traceId);
    }
}
