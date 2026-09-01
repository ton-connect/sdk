import { describe, it, expect } from 'vitest';
import { trackWalletPick } from 'src/app/utils/wallet-selection';
import { TonConnectUITracker } from 'src/tracker/ton-connect-ui-tracker';

/**
 * The platform branch decides which of the two events a pick becomes, and getting it backwards
 * would be invisible: both events exist, both would be accepted downstream, and the modal would
 * behave identically. It is also the one part of the wiring the browser cannot exercise, because
 * the automation viewport pins `window.innerWidth`.
 */
function recordingTracker(): {
    tracker: TonConnectUITracker;
    calls: Array<{ method: string; args: unknown[] }>;
} {
    const calls: Array<{ method: string; args: unknown[] }> = [];
    const tracker = {
        trackWalletSelected: (...args: unknown[]) => calls.push({ method: 'selected', args }),
        trackWalletPreselected: (...args: unknown[]) => calls.push({ method: 'preselected', args })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any as TonConnectUITracker;

    return { tracker, calls };
}

describe.each([
    { isMobile: true, expected: 'selected' },
    { isMobile: false, expected: 'preselected' }
])('app/utils/wallet-selection: trackWalletPick', ({ isMobile, expected }) => {
    it(`records a ${expected} pick when isMobile is ${isMobile}`, () => {
        const { tracker, calls } = recordingTracker();

        trackWalletPick(tracker, {
            isMobile,
            walletAppName: 'tonkeeper',
            surface: 'universal-modal',
            selectionSource: 'manual',
            traceId: 'trace-1'
        });

        expect(calls).toEqual([
            { method: expected, args: ['tonkeeper', 'universal-modal', 'manual', 'trace-1'] }
        ]);
    });
});

describe('app/utils/wallet-selection: trackWalletPick', () => {
    it('emits exactly once per pick', () => {
        const { tracker, calls } = recordingTracker();

        trackWalletPick(tracker, {
            isMobile: true,
            walletAppName: 'tonhub',
            surface: 'all-wallets-list',
            selectionSource: 'auto-dapp-directed',
            traceId: 'trace-2'
        });

        expect(calls).toHaveLength(1);
    });
});
