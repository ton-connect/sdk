// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRoot } from 'solid-js';

vi.mock('src/app/utils/web-api', async () => {
    const actual =
        await vi.importActual<typeof import('src/app/utils/web-api')>('src/app/utils/web-api');

    return {
        ...actual,
        getUserAgent: () => ({ os: 'android', browser: 'chrome' })
    };
});

const { default: androidBackHandler } = await import('src/app/directives/android-back-handler');

type Config = { isEnabled: boolean; onClose: () => void };

const flushMicrotasks = (): Promise<void> => new Promise<void>(resolve => setTimeout(resolve, 0));

// jsdom dispatches popstate asynchronously after history.back(); it lands
// later than a microtask flush but before ~50ms in practice.
const settle = (ms = 80): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

const mount = (config: Config): (() => void) =>
    createRoot(dispose => {
        androidBackHandler({} as Element, () => config);
        return dispose;
    });

describe('androidBackHandler', () => {
    beforeEach(() => {
        history.replaceState(null, '');
    });

    afterEach(async () => {
        // Let any leftover macrotasks settle so they don't bleed into the next test.
        await settle();
        history.replaceState(null, '');
    });

    it('pushes a history entry and fires onClose on back press', async () => {
        const onClose = vi.fn();
        const dispose = mount({ isEnabled: true, onClose });
        await flushMicrotasks();

        expect(history.state?.androidBackHandler).toBe(true);

        history.back();
        await settle();

        expect(onClose).toHaveBeenCalledTimes(1);
        dispose();
        await settle();
    });

    it('is a no-op when isEnabled=false', async () => {
        const onClose = vi.fn();
        const dispose = mount({ isEnabled: false, onClose });
        await flushMicrotasks();

        expect(history.state?.androidBackHandler).toBeUndefined();
        dispose();
    });

    describe('regression: chained modals must not share a history entry', () => {
        // Scenario from the bug report:
        //   1. wallets-modal (A) is open — its state is on top of history.
        //   2. User connects → A unmounts → cleanup schedules history.back() via rAF.
        //   3. Same tick: action-modal (B) mounts.
        //   4. (BUG) A's deferred history.back() pops B's entry instead of A's,
        //      and the popstate fires B's handler → onClose → bridge abort →
        //      "Transaction was not sent" even though the wallet did sign.
        //
        //   This test asserts that B's onClose is NOT called as a side effect of
        //   A's cleanup, and that B still owns the top history entry afterwards.
        it("does not pop B's entry when A's cleanup is still pending", async () => {
            const onCloseA = vi.fn();
            const onCloseB = vi.fn();

            // (1) wallets-modal opens.
            const disposeA = mount({ isEnabled: true, onClose: onCloseA });
            await flushMicrotasks();
            expect(history.state?.androidBackHandler).toBe(true);

            // (2) wallets-modal closes — schedules history.back() via rAF.
            disposeA();

            // (3) Same synchronous tick: action-modal opens.
            const disposeB = mount({ isEnabled: true, onClose: onCloseB });

            // (4) Let A's deferred history.back() + its popstate flush, then
            //     give B's awaited setup a chance to run.
            await settle();

            // B owns the top entry...
            expect(history.state?.androidBackHandler).toBe(true);
            // ...and was not closed by A's stale popstate.
            expect(onCloseB).not.toHaveBeenCalled();
            expect(onCloseA).not.toHaveBeenCalled();

            // Sanity: pressing back now closes B, not anything else.
            history.back();
            await settle();
            expect(onCloseB).toHaveBeenCalledTimes(1);
            expect(onCloseA).not.toHaveBeenCalled();

            disposeB();
            await settle();
        });

        it("falls back to a timeout if popstate from A's history.back() never arrives", async () => {
            const onCloseA = vi.fn();
            const onCloseB = vi.fn();

            const disposeA = mount({ isEnabled: true, onClose: onCloseA });
            await flushMicrotasks();
            expect(history.state?.androidBackHandler).toBe(true);

            // Simulate an environment where popstate is swallowed (some
            // embedded WebViews / TWA contexts). history.back() runs but
            // dispatches no event — without the fallback, pendingCleanup
            // would stay pending forever and B would never push its state.
            const backSpy = vi.spyOn(window.history, 'back').mockImplementation(() => {
                // no-op: do not navigate, do not dispatch popstate
            });

            disposeA();
            const disposeB = mount({ isEnabled: true, onClose: onCloseB });

            // Wait past the directive's POPSTATE_TIMEOUT_MS (500ms).
            await new Promise(resolve => setTimeout(resolve, 700));

            // The fallback fired, releasing pendingCleanup → B got to push.
            expect(history.state?.androidBackHandler).toBe(true);
            expect(backSpy).toHaveBeenCalledTimes(1);

            // And B's listener is still wired up.
            backSpy.mockRestore();
            history.back();
            await settle();
            expect(onCloseB).toHaveBeenCalledTimes(1);

            disposeB();
            await settle();
        });

        it('disposes cleanly if B unmounts before its deferred setup runs', async () => {
            const onCloseA = vi.fn();
            const onCloseB = vi.fn();

            const disposeA = mount({ isEnabled: true, onClose: onCloseA });
            await flushMicrotasks();

            disposeA();
            const disposeB = mount({ isEnabled: true, onClose: onCloseB });
            // B never gets to pushState because we dispose it before A's
            // pendingCleanup resolves.
            disposeB();

            await settle();

            // History is back to its pre-modal baseline; nothing leaked.
            expect(history.state?.androidBackHandler).toBeUndefined();
            expect(onCloseA).not.toHaveBeenCalled();
            expect(onCloseB).not.toHaveBeenCalled();
        });
    });
});
