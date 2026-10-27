import { describe, expect, vi } from 'vitest';
import { AnalyticsManager } from 'src/analytics/analytics-manager';
import { InjectedProvider } from 'src/provider/injected/injected-provider';
import { InjectedWalletApi } from 'src/provider/injected/models/injected-wallet-api';
import { BridgeConnectionStorage } from 'src/storage/bridge-connection-storage';

describe('Injected provider', () => {
    const originalWindow = (
        InjectedProvider as unknown as {
            window: Window | undefined;
        }
    ).window;

    afterEach(() => {
        (
            InjectedProvider as unknown as {
                window: Window | undefined;
            }
        ).window = originalWindow;
    });

    it('should initialize analytics if injected wallet does not provide deviceInfo', () => {
        const injectedWalletKey = 'legacyTonWallet';
        const injectedWallet = {
            walletInfo: {
                name: 'Legacy TON Wallet',
                app_name: 'legacy-ton-wallet',
                image: 'https://example.com/wallet.png',
                about_url: 'https://example.com',
                platforms: ['chrome'],
                features: []
            },
            protocolVersion: 2,
            isWalletBrowser: false,
            connect: vi.fn(),
            restoreConnection: vi.fn(),
            send: vi.fn(),
            listen: vi.fn(),
            disconnect: vi.fn()
        } as unknown as InjectedWalletApi;
        const injectedWindow = {
            [injectedWalletKey]: {
                tonconnect: injectedWallet
            }
        } as unknown as Window;
        const analyticsManager = {
            scoped: vi.fn()
        } as unknown as AnalyticsManager;

        (
            InjectedProvider as unknown as {
                window: Window | undefined;
            }
        ).window = injectedWindow;

        expect(
            () =>
                new InjectedProvider(
                    {} as BridgeConnectionStorage,
                    injectedWalletKey,
                    analyticsManager
                )
        ).not.toThrow();
        expect(analyticsManager.scoped).toHaveBeenCalledWith({
            bridge_key: injectedWalletKey,
            wallet_app_name: '',
            wallet_app_version: ''
        });
    });
});
