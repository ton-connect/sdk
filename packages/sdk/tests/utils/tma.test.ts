// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Detection is memoised on first use, so each case re-imports the module to get a fresh read of
 * the globals. The point of these is `client_environment`: before this moved into core it was
 * empty for every dApp not using `@tonconnect/ui`, which is exactly the population the
 * connection events were added to reveal.
 */
async function freshDetection(): Promise<typeof import('src/utils/tma')> {
    vi.resetModules();
    return await import('src/utils/tma');
}

async function freshEnvironment(): Promise<
    InstanceType<typeof import('src/environment/default-environment').DefaultEnvironment>
> {
    vi.resetModules();
    const { DefaultEnvironment } = await import('src/environment/default-environment');
    return new DefaultEnvironment();
}

beforeEach(() => {
    delete (window as { Telegram?: unknown }).Telegram;
    delete (window as { TelegramWebviewProxy?: unknown }).TelegramWebviewProxy;
    window.sessionStorage.clear();
    window.location.hash = '';
});

describe('utils/tma: outside a Mini App', () => {
    it('reports web, not an empty string', async () => {
        expect(await (await freshEnvironment()).getClientEnvironment()).toBe('web');
    });

    it('detects no platform and no user', async () => {
        const tma = await freshDetection();
        expect(tma.isInTMA()).toBe(false);
        expect(tma.getTmaPlatform()).toBe('unknown');
        expect(tma.getTgUser()).toBeUndefined();
    });
});

describe('utils/tma: inside a Mini App', () => {
    it('detects the platform advertised on window.Telegram', async () => {
        (window as { Telegram?: unknown }).Telegram = { WebApp: { platform: 'ios' } };

        const tma = await freshDetection();
        expect(tma.isInTMA()).toBe(true);
        expect(tma.getTmaPlatform()).toBe('ios');
        expect(tma.isTmaPlatform('ios', 'android')).toBe(true);
        expect(await (await freshEnvironment()).getClientEnvironment()).toBe('miniapp');
    });

    it('detects the platform from launch params in the URL hash', async () => {
        window.location.hash = '#tgWebAppPlatform=tdesktop&tgWebAppVersion=7.2';

        const tma = await freshDetection();
        expect(tma.getTmaPlatform()).toBe('tdesktop');
        expect(tma.getTmaWebAppVersion()).toBe('7.2');
    });

    it('treats a webview proxy with no platform as the Telegram browser', async () => {
        (window as { TelegramWebviewProxy?: unknown }).TelegramWebviewProxy = {
            postEvent: () => {}
        };

        const tma = await freshDetection();
        expect(tma.isInTMA()).toBe(true);
        expect(tma.isInTelegramBrowser()).toBe(true);
    });

    it('reads a non-premium user, whose is_premium Telegram omits entirely', async () => {
        const user = encodeURIComponent(JSON.stringify({ id: 42, first_name: 'A' }));
        window.location.hash = `#tgWebAppPlatform=android&tgWebAppData=user%3D${user}`;

        expect((await freshDetection()).getTgUser()).toEqual({ id: 42, isPremium: false });
    });

    it('reads a premium user', async () => {
        const user = encodeURIComponent(JSON.stringify({ id: 7, is_premium: true }));
        window.location.hash = `#tgWebAppPlatform=android&tgWebAppData=user%3D${user}`;

        expect((await freshDetection()).getTgUser()).toEqual({ id: 7, isPremium: true });
    });
});
