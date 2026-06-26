import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const JS_BRIDGE_KEY = 'testwallet';

declare global {
    var testwallet: { tonconnect: object } | undefined;
}

async function importInjectedProvider(): Promise<
    typeof import('src/provider/injected/injected-provider')
> {
    // InjectedProvider captures `window` statically at module evaluation,
    // so the module must be (re)imported after the window stub is in place.
    return import('src/provider/injected/injected-provider');
}

describe('InjectedProvider.waitForWalletInjection', () => {
    beforeEach(() => {
        vi.resetModules();
        // minimal window stub for the node test environment
        (globalThis as Record<string, unknown>).window = globalThis;
        delete globalThis.testwallet;
    });

    afterEach(() => {
        delete (globalThis as Record<string, unknown>).window;
        delete globalThis.testwallet;
    });

    it('resolves true immediately when the bridge is already injected', async () => {
        globalThis.testwallet = { tonconnect: {} };
        const { InjectedProvider } = await importInjectedProvider();

        await expect(
            InjectedProvider.waitForWalletInjection(JS_BRIDGE_KEY, { timeoutMs: 1_000 })
        ).resolves.toBe(true);
    });

    it('resolves true when the bridge is injected after a delay (extension loses the race to the dapp)', async () => {
        const { InjectedProvider } = await importInjectedProvider();

        setTimeout(() => {
            globalThis.testwallet = { tonconnect: {} };
        }, 300);

        await expect(
            InjectedProvider.waitForWalletInjection(JS_BRIDGE_KEY, { timeoutMs: 3_000 })
        ).resolves.toBe(true);
    });

    it('resolves false when the bridge never appears', async () => {
        const { InjectedProvider } = await importInjectedProvider();

        await expect(
            InjectedProvider.waitForWalletInjection(JS_BRIDGE_KEY, {
                timeoutMs: 300,
                intervalMs: 50
            })
        ).resolves.toBe(false);
    });

    it('resolves false promptly when aborted', async () => {
        const { InjectedProvider } = await importInjectedProvider();

        const abortController = new AbortController();
        setTimeout(() => abortController.abort(), 100);

        const startTime = Date.now();
        await expect(
            InjectedProvider.waitForWalletInjection(JS_BRIDGE_KEY, {
                timeoutMs: 10_000,
                signal: abortController.signal
            })
        ).resolves.toBe(false);
        expect(Date.now() - startTime).toBeLessThan(1_000);
    });
});
