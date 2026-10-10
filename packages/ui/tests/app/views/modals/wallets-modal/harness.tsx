import { JSX } from 'solid-js';
import { render } from 'solid-js/web';
import { ThemeProvider } from 'solid-styled-components';
import { createI18nContext, I18nContext } from '@solid-primitives/i18n';
import { Mock, vi } from 'vitest';
import { ITonConnect, WalletInfoInjectable, WalletInfoRemote } from '@tonconnect/sdk';
import { i18nDictionary } from 'src/app/i18n';
import { themeState } from 'src/app/state/theme-state';
import { ConnectorContext } from 'src/app/state/connector.context';
import { setAppState } from 'src/app/state/app.state';
import { TonConnectUITracker } from 'src/tracker/ton-connect-ui-tracker';
import { WalletsModalState } from 'src/models';

export const OPENED: WalletsModalState = {
    status: 'opened',
    closeReason: null,
    traceId: 'trace-1'
};

export type Recorders = {
    connect: Mock;
    trackWalletSelected: Mock;
    trackConnectionInitiated: Mock;
};

/**
 * Mounts a modal under the providers `App` gives it, with the connector and tracker replaced by
 * recorders. The root is attached to the document because Solid delegates click handlers to it.
 */
export function mountModal(
    ui: () => JSX.Element
): Recorders & { root: HTMLElement; dispose: () => void } {
    const connect = vi.fn(() => 'https://app.tonkeeper.com/ton-connect?v=2&id=abc&r=%7B%7D');
    const connector = { connect, onStatusChange: () => () => {} } as unknown as ITonConnect;
    const trackWalletSelected = vi.fn();
    const trackConnectionInitiated = vi.fn();
    const tracker = {
        trackWalletSelected,
        trackWalletPreselected: vi.fn(),
        trackConnectionInitiated
    } as unknown as TonConnectUITracker;
    setAppState({ connector, tracker });

    const root = document.createElement('div');
    document.body.appendChild(root);
    const unmount = render(
        () => (
            <I18nContext.Provider value={createI18nContext(i18nDictionary, 'en')}>
                <ConnectorContext.Provider value={connector}>
                    <ThemeProvider theme={themeState}>{ui()}</ThemeProvider>
                </ConnectorContext.Provider>
            </I18nContext.Provider>
        ),
        root
    );

    return {
        root,
        connect,
        trackWalletSelected,
        trackConnectionInitiated,
        dispose: () => {
            unmount();
            root.remove();
        }
    };
}

export function remoteWallet(
    appName: string,
    platforms: WalletInfoRemote['platforms'],
    injectable?: Pick<WalletInfoInjectable, 'jsBridgeKey' | 'injected'>
): WalletInfoRemote & Partial<WalletInfoInjectable> {
    return {
        appName,
        name: appName,
        imageUrl: '',
        aboutUrl: '',
        platforms,
        universalLink: `https://${appName}.example/ton-connect`,
        bridgeUrl: `https://${appName}.example/bridge`,
        ...(injectable ? { ...injectable, embedded: false } : {})
    };
}

export function clickButton(root: HTMLElement, label: string): void {
    const button = Array.from(root.querySelectorAll('button')).find(candidate =>
        candidate.textContent?.includes(label)
    );
    if (!button) {
        throw new Error(`No button labelled "${label}"`);
    }
    button.click();
}
