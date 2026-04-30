// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const LOCATION_HASH =
    '#tgWebAppData=user%3D%257B%2522id%2522%253A123456789%252C%2522first_name%2522%253A%2522Test%2522%252C%2522last_name%2522%253A%2522User%2522%252C%2522username%2522%253A%2522testuser%2522%252C%2522language_code%2522%253A%2522en%2522%252C%2522is_premium%2522%253Atrue%252C%2522allows_write_to_pm%2522%253Atrue%252C%2522photo_url%2522%253A%2522https%253A%252F%252Ft.me%252Fi%252Fuserpic%252F320%252Fplaceholder.svg%2522%257D%26chat_instance%3D-1234567890123456789%26chat_type%3Dprivate%26auth_date%3D1700000000%26signature%3DdGVzdC1zaWduYXR1cmUtdGhhdC1pcy1ub3QtcmVhbC1qdXN0LWZha2UtZGF0YQ%26hash%3Da1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2&tgWebAppVersion=9.5&tgWebAppPlatform=macos&tgWebAppThemeParams=%7B%22button_color%22%3A%22%232ea6ff%22%2C%22button_text_color%22%3A%22%23ffffff%22%2C%22header_bg_color%22%3A%22%23131415%22%2C%22destructive_text_color%22%3A%22%23ef5b5b%22%2C%22bottom_bar_bg_color%22%3A%22%23213040%22%2C%22bg_color%22%3A%22%2318222d%22%2C%22subtitle_text_color%22%3A%22%23b1c3d5%22%2C%22link_color%22%3A%22%2362bcf9%22%2C%22text_color%22%3A%22%23ffffff%22%2C%22section_header_text_color%22%3A%22%23b1c3d5%22%2C%22section_bg_color%22%3A%22%2318222d%22%2C%22accent_text_color%22%3A%22%232ea6ff%22%2C%22section_separator_color%22%3A%22%23213040%22%2C%22secondary_bg_color%22%3A%22%23131415%22%2C%22hint_color%22%3A%22%23b1c3d5%22%7D';

const TELEGRAM_INIT_PARAMS =
    '{"tgWebAppData":"user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22Test%22%2C%22last_name%22%3A%22User%22%2C%22username%22%3A%22testuser%22%2C%22language_code%22%3A%22en%22%2C%22is_premium%22%3Atrue%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%2F%2Ft.me%2Fi%2Fuserpic%2F320%2Fplaceholder.svg%22%7D&chat_instance=-1234567890123456789&chat_type=private&auth_date=1700000000&signature=dGVzdC1zaWduYXR1cmUtdGhhdC1pcy1ub3QtcmVhbC1qdXN0LWZha2UtZGF0YQ&hash=a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2","tgWebAppVersion":"9.5","tgWebAppPlatform":"macos","tgWebAppThemeParams":"{\\"button_color\\":\\"#2ea6ff\\",\\"button_text_color\\":\\"#ffffff\\",\\"header_bg_color\\":\\"#131415\\",\\"destructive_text_color\\":\\"#ef5b5b\\",\\"bottom_bar_bg_color\\":\\"#213040\\",\\"bg_color\\":\\"#18222d\\",\\"subtitle_text_color\\":\\"#b1c3d5\\",\\"link_color\\":\\"#62bcf9\\",\\"text_color\\":\\"#ffffff\\",\\"section_header_text_color\\":\\"#b1c3d5\\",\\"section_bg_color\\":\\"#18222d\\",\\"accent_text_color\\":\\"#2ea6ff\\",\\"section_separator_color\\":\\"#213040\\",\\"secondary_bg_color\\":\\"#131415\\",\\"hint_color\\":\\"#b1c3d5\\"}"}';

const urlTgLaunchParams = `tgWebAppData=user%3D%257B%2522id%2522%253A123456789%252C%2522first_name%2522%253A%2522Test%2522%252C%2522last_name%2522%253A%2522User%2522%252C%2522username%2522%253A%2522testuser%2522%252C%2522language_code%2522%253A%2522en%2522%252C%2522is_premium%2522%253Atrue%252C%2522photo_url%2522%253A%2522https%253A%252F%252Ft.me%252Fi%252Fuserpic%252F320%252Fplaceholder.svg%2522%257D%26chat_instance%3D1234567890123456789%26chat_type%3Dprivate%26auth_date%3D1700000000%26signature%3DdGVzdC1zaWduYXR1cmUtdGhhdC1pcy1ub3QtcmVhbC1qdXN0LWZha2UtZGF0YQ%26hash%3Da1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2&tgWebAppVersion=9.5&tgWebAppPlatform=macos&tgWebAppThemeParams=%7B%22text_color%22%3A%22%23ffffff%22%2C%22accent_text_color%22%3A%22%232ea6ff%22%2C%22destructive_text_color%22%3A%22%23ef5b5b%22%2C%22button_color%22%3A%22%232ea6ff%22%2C%22hint_color%22%3A%22%23b1c3d5%22%2C%22button_text_color%22%3A%22%23ffffff%22%2C%22section_separator_color%22%3A%22%23213040%22%2C%22secondary_bg_color%22%3A%22%23131415%22%2C%22header_bg_color%22%3A%22%23131415%22%2C%22subtitle_text_color%22%3A%22%23b1c3d5%22%2C%22section_bg_color%22%3A%22%2318222d%22%2C%22section_header_text_color%22%3A%22%23b1c3d5%22%2C%22link_color%22%3A%22%2362bcf9%22%2C%22bg_color%22%3A%22%2318222d%22%2C%22bottom_bar_bg_color%22%3A%22%23213040%22%7D`;

const TAPPS_LAUNCH_PARAMS_RAW = `${urlTgLaunchParams}`;
const TAPPS_LAUNCH_PARAMS_QUOTES = `"${urlTgLaunchParams}"`;

const tappsLaunchParamsCases = [
    ['raw', TAPPS_LAUNCH_PARAMS_RAW],
    ['JSON-string', TAPPS_LAUNCH_PARAMS_QUOTES]
] as const;

describe('tma-api from location.hash', () => {
    beforeEach(() => {
        vi.resetModules();
        sessionStorage.clear();
    });

    it('should parse platform from location.hash', async () => {
        window.location.hash = LOCATION_HASH;

        const { isTmaPlatform } = await import('src/app/utils/tma-api');

        expect(isTmaPlatform('macos')).toBe(true);
    });

    it('should detect TMA environment from location.hash', async () => {
        window.location.hash = LOCATION_HASH;

        const { isInTMA } = await import('src/app/utils/tma-api');

        expect(isInTMA()).toBe(true);
    });

    it('should parse telegram user from location.hash', async () => {
        window.location.hash = LOCATION_HASH;

        const { getTgUser } = await import('src/app/utils/tma-api');

        expect(getTgUser()).toEqual({
            id: 123456789,
            isPremium: true
        });
    });
});

describe('tma-api fallback from tapps/launchParams', () => {
    beforeEach(() => {
        vi.resetModules();
        sessionStorage.clear();
        window.location.hash = '';
    });

    it.each(tappsLaunchParamsCases)(
        'should parse platform from tapps/launchParams when location.hash is empty (%s)',
        async (_label, launchParams) => {
            sessionStorage.setItem('tapps/launchParams', launchParams);

            const { isTmaPlatform } = await import('src/app/utils/tma-api');

            expect(isTmaPlatform('macos')).toBe(true);
        }
    );

    it.each(tappsLaunchParamsCases)(
        'should detect TMA environment from tapps/launchParams (%s)',
        async (_label, launchParams) => {
            sessionStorage.setItem('tapps/launchParams', launchParams);

            const { isInTMA } = await import('src/app/utils/tma-api');

            expect(isInTMA()).toBe(true);
        }
    );

    it.each(tappsLaunchParamsCases)(
        'should parse telegram user from tapps/launchParams (%s)',
        async (_label, launchParams) => {
            sessionStorage.setItem('tapps/launchParams', launchParams);

            const { getTgUser } = await import('src/app/utils/tma-api');

            expect(getTgUser()).toEqual({
                id: 123456789,
                isPremium: true
            });
        }
    );
});

describe('tma-api fallback from __telegram__initParams', () => {
    beforeEach(() => {
        vi.resetModules();
        sessionStorage.clear();
        window.location.hash = '';
    });

    it('should parse platform from __telegram__initParams when location.hash is empty', async () => {
        sessionStorage.setItem('__telegram__initParams', TELEGRAM_INIT_PARAMS);

        const { isTmaPlatform } = await import('src/app/utils/tma-api');

        expect(isTmaPlatform('macos')).toBe(true);
    });

    it('should detect TMA environment from __telegram__initParams', async () => {
        sessionStorage.setItem('__telegram__initParams', TELEGRAM_INIT_PARAMS);

        const { isInTMA } = await import('src/app/utils/tma-api');

        expect(isInTMA()).toBe(true);
    });

    it('should parse telegram user from __telegram__initParams', async () => {
        sessionStorage.setItem('__telegram__initParams', TELEGRAM_INIT_PARAMS);

        const { getTgUser } = await import('src/app/utils/tma-api');

        expect(getTgUser()).toEqual({
            id: 123456789,
            isPremium: true
        });
    });
});

describe('tma-api with no init data', () => {
    beforeEach(() => {
        vi.resetModules();
        sessionStorage.clear();
        window.location.hash = '';
        delete window.TelegramWebviewProxy;
        delete window.TelegramWebview;
        delete window.Telegram;
    });

    it('should return unknown platform when no data is available', async () => {
        const { isTmaPlatform } = await import('src/app/utils/tma-api');

        expect(isTmaPlatform('unknown')).toBe(true);
    });

    it('should not detect TMA environment', async () => {
        const { isInTMA } = await import('src/app/utils/tma-api');

        expect(isInTMA()).toBe(false);
    });

    it('should not detect Telegram browser', async () => {
        const { isInTelegramBrowser } = await import('src/app/utils/tma-api');

        expect(isInTelegramBrowser()).toBe(false);
    });

    it('should return undefined for telegram user', async () => {
        const { getTgUser } = await import('src/app/utils/tma-api');

        expect(getTgUser()).toBeUndefined();
    });
});

describe('tma-api isTmaPlatform with multiple platforms', () => {
    beforeEach(() => {
        vi.resetModules();
        sessionStorage.clear();
    });

    it('should match when one of multiple platforms matches', async () => {
        window.location.hash = LOCATION_HASH;

        const { isTmaPlatform } = await import('src/app/utils/tma-api');

        expect(isTmaPlatform('ios', 'macos', 'android')).toBe(true);
    });

    it('should not match when none of the platforms match', async () => {
        window.location.hash = LOCATION_HASH;

        const { isTmaPlatform } = await import('src/app/utils/tma-api');

        expect(isTmaPlatform('ios', 'android', 'tdesktop')).toBe(false);
    });
});

describe('tma-api TelegramWebviewProxy detection', () => {
    beforeEach(() => {
        vi.resetModules();
        sessionStorage.clear();
        window.location.hash = '';
        delete window.TelegramWebviewProxy;
        delete window.TelegramWebview;
        delete window.Telegram;
    });

    afterEach(() => {
        delete window.TelegramWebviewProxy;
        delete window.TelegramWebview;
        delete window.Telegram;
    });

    it('should detect TMA via TelegramWebviewProxy even without initParams', async () => {
        window.TelegramWebviewProxy = { postEvent: vi.fn() };

        const { isInTMA } = await import('src/app/utils/tma-api');

        expect(isInTMA()).toBe(true);
    });

    it('should detect Telegram browser via TelegramWebview when platform is unknown', async () => {
        window.TelegramWebview = {};

        const { isInTelegramBrowser } = await import('src/app/utils/tma-api');

        expect(isInTelegramBrowser()).toBe(true);
    });

    it('should not detect Telegram browser when platform is known', async () => {
        window.location.hash = LOCATION_HASH;

        const { isInTelegramBrowser } = await import('src/app/utils/tma-api');

        expect(isInTelegramBrowser()).toBe(false);
    });
});

describe('tma-api platform fallback to Telegram.WebApp.platform', () => {
    beforeEach(() => {
        vi.resetModules();
        sessionStorage.clear();
        window.location.hash = '';
        delete window.Telegram;
    });

    afterEach(() => {
        delete window.Telegram;
    });

    it('should read platform from Telegram.WebApp when initParams has no platform', async () => {
        window.Telegram = { WebApp: { platform: 'ios', version: '7.0' } };

        const { isTmaPlatform } = await import('src/app/utils/tma-api');

        expect(isTmaPlatform('ios')).toBe(true);
    });
});

describe('tma-api location.hash takes priority over sessionStorage', () => {
    beforeEach(() => {
        vi.resetModules();
        sessionStorage.clear();
    });

    it('should use location.hash params over sessionStorage params', async () => {
        window.location.hash = LOCATION_HASH;
        const altParams = TELEGRAM_INIT_PARAMS.replace('"macos"', '"ios"');
        sessionStorage.setItem('__telegram__initParams', altParams);

        const { isTmaPlatform } = await import('src/app/utils/tma-api');

        expect(isTmaPlatform('macos')).toBe(true);
        expect(isTmaPlatform('ios')).toBe(false);
    });
});

describe('tma-api user', () => {
    beforeEach(() => {
        vi.resetModules();
        sessionStorage.clear();
        window.location.hash = '';
    });

    it('should return user when is_premium is missing', async () => {
        const params = JSON.stringify({
            tgWebAppData: 'user=%7B%22id%22%3A123456789%7D',
            tgWebAppVersion: '9.5',
            tgWebAppPlatform: 'macos'
        });
        sessionStorage.setItem('__telegram__initParams', params);

        const { getTgUser } = await import('src/app/utils/tma-api');

        expect(getTgUser()).toEqual({
            id: 123456789,
            isPremium: false
        });
    });

    it('should return user with isPremium false', async () => {
        const params = JSON.stringify({
            tgWebAppData: 'user=%7B%22id%22%3A123456789%2C%22is_premium%22%3Afalse%7D',
            tgWebAppVersion: '9.5',
            tgWebAppPlatform: 'macos'
        });
        sessionStorage.setItem('__telegram__initParams', params);

        const { getTgUser } = await import('src/app/utils/tma-api');

        expect(getTgUser()).toEqual({
            id: 123456789,
            isPremium: false
        });
    });
    it('should return user with isPremium true', async () => {
        const params = JSON.stringify({
            tgWebAppData: 'user=%7B%22id%22%3A123456789%2C%22is_premium%22%3Atrue%7D',
            tgWebAppVersion: '9.5',
            tgWebAppPlatform: 'macos'
        });
        sessionStorage.setItem('__telegram__initParams', params);

        const { getTgUser } = await import('src/app/utils/tma-api');

        expect(getTgUser()).toEqual({
            id: 123456789,
            isPremium: true
        });
    });
});

describe('tma-api fallback from self-persisted ton-connect storage', () => {
    const STORAGE_KEY = 'ton-connect-session_storage_launchParams';

    function setStoredParams(platform: string) {
        sessionStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                tgWebAppData: 'user=%7B%22id%22%3A123456789%2C%22is_premium%22%3Atrue%7D',
                tgWebAppVersion: '9.5',
                tgWebAppPlatform: platform
            })
        );
    }

    beforeEach(() => {
        vi.resetModules();
        sessionStorage.clear();
        window.location.hash = '';
        delete window.TelegramWebviewProxy;
        delete window.TelegramWebview;
        delete window.Telegram;
    });

    afterEach(() => {
        delete window.TelegramWebviewProxy;
        delete window.TelegramWebview;
        delete window.Telegram;
    });

    it.each(['android', 'ios', 'macos', 'tdesktop', 'weba', 'web'] as const)(
        'should detect platform "%s" and isInTMA from self-persisted storage',
        async platform => {
            setStoredParams(platform);

            const { isTmaPlatform, isInTMA } = await import('src/app/utils/tma-api');

            expect(isTmaPlatform(platform)).toBe(true);
            expect(isInTMA()).toBe(true);
        }
    );

    it('should not detect Telegram browser when platform is known', async () => {
        setStoredParams('macos');

        const { isInTelegramBrowser } = await import('src/app/utils/tma-api');

        expect(isInTelegramBrowser()).toBe(false);
    });

    it('should detect Telegram browser via TelegramWebview when platform is unknown', async () => {
        setStoredParams('unknown');
        window.TelegramWebview = {};

        const { isInTelegramBrowser } = await import('src/app/utils/tma-api');

        expect(isInTelegramBrowser()).toBe(true);
    });

    it('should parse telegram user from self-persisted storage', async () => {
        setStoredParams('macos');

        const { getTgUser } = await import('src/app/utils/tma-api');

        expect(getTgUser()).toEqual({
            id: 123456789,
            isPremium: true
        });
    });
});

describe('tma-api sendOpenTelegramLink', () => {
    beforeEach(() => {
        vi.resetModules();
        sessionStorage.clear();
        window.location.hash = LOCATION_HASH;
    });

    it('should call fallback for non-http protocol', async () => {
        const { sendOpenTelegramLink } = await import('src/app/utils/tma-api');
        const fallback = vi.fn();

        sendOpenTelegramLink('ftp://t.me/test', fallback);

        expect(fallback).toHaveBeenCalled();
    });

    it('should throw for non-http protocol without fallback', async () => {
        const { sendOpenTelegramLink } = await import('src/app/utils/tma-api');

        expect(() => sendOpenTelegramLink('ftp://t.me/test')).toThrow();
    });

    it('should call fallback for non-t.me hostname', async () => {
        const { sendOpenTelegramLink } = await import('src/app/utils/tma-api');
        const fallback = vi.fn();

        sendOpenTelegramLink('https://example.com/test', fallback);

        expect(fallback).toHaveBeenCalled();
    });

    it('should throw for non-t.me hostname without fallback', async () => {
        const { sendOpenTelegramLink } = await import('src/app/utils/tma-api');

        expect(() => sendOpenTelegramLink('https://example.com/test')).toThrow();
    });

    it('should not throw for valid t.me link', async () => {
        const { sendOpenTelegramLink } = await import('src/app/utils/tma-api');

        expect(() => sendOpenTelegramLink('https://t.me/wallet')).not.toThrow();
    });

    describe('embedded request length guard (non-TMA fallback)', () => {
        // Force the non-TMA branch: clear the version-bearing hash so that
        // sendOpenTelegramLink falls back to openLinkBlank → window.open.
        beforeEach(() => {
            window.location.hash = '';
        });

        it('passes short t.me direct links through unchanged', async () => {
            const { sendOpenTelegramLink } = await import('src/app/utils/tma-api');
            const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

            const link = 'https://t.me/wallet/start?startapp=tonconnect-v__2-id__abc';
            sendOpenTelegramLink(link);

            const opened = openSpy.mock.calls[0]![0] as string;
            expect(opened).toBe(link);

            openSpy.mockRestore();
        });

        it('passes short t.me legacy attach links through unchanged (path/search preserved)', async () => {
            const { sendOpenTelegramLink } = await import('src/app/utils/tma-api');
            const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

            const link = 'https://t.me/wallet?attach=wallet';
            sendOpenTelegramLink(link);

            const opened = openSpy.mock.calls[0]![0] as string;
            expect(opened).toContain('attach=wallet');

            openSpy.mockRestore();
        });

        it('strips e__ from a long t.me direct link', async () => {
            const { sendOpenTelegramLink } = await import('src/app/utils/tma-api');
            const { MAX_LINK_LENGTH } = await import('src/app/utils/web-api');
            const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

            const longE = 'A'.repeat(MAX_LINK_LENGTH);
            const link = `https://t.me/wallet/start?startapp=tonconnect-v__2-id__abc-r__req-e__${longE}`;
            expect(link.length).toBeGreaterThan(MAX_LINK_LENGTH);

            sendOpenTelegramLink(link);

            const opened = openSpy.mock.calls[0]![0] as string;
            expect(opened).not.toContain('e__');
            expect(opened).not.toContain(longE);
            expect(opened).toContain('v__2');
            expect(opened).toContain('id__abc');
            expect(opened).toContain('r__req');

            openSpy.mockRestore();
        });

        it('strips e__ from a long t.me legacy attach link', async () => {
            const { sendOpenTelegramLink } = await import('src/app/utils/tma-api');
            const { MAX_LINK_LENGTH } = await import('src/app/utils/web-api');
            const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

            const longE = 'A'.repeat(MAX_LINK_LENGTH);
            const link = `https://t.me/wallet?attach=wallet&startapp=tonconnect-v__2-id__abc-e__${longE}`;
            expect(link.length).toBeGreaterThan(MAX_LINK_LENGTH);

            sendOpenTelegramLink(link);

            const opened = openSpy.mock.calls[0]![0] as string;
            expect(opened).not.toContain('e__');
            expect(opened).not.toContain(longE);
            expect(opened).toContain('id__abc');

            openSpy.mockRestore();
        });
    });
});
