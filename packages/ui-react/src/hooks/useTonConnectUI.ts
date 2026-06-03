import { useCallback, useContext } from 'react';
import { TonConnectUIContext } from '../components/TonConnectUIProvider';
import { TonConnectUI, TonConnectUiOptions } from '@tonconnect/ui';
import { checkProvider } from '../utils/errors';
import { isServerSide } from '../utils/web';

/**
 * Returns a tuple of:
 *
 * - the singleton `TonConnectUI` instance — call every method (`connectWallet`,
 *   `sendTransaction`, `signData`, `signMessage`, modal helpers) on it;
 * - a `setOptions(options)` callback that merges the partial
 *   `TonConnectUiOptions` into the live instance via its `uiOptions`
 *   setter, triggering an immediate re-render.
 *
 * Must be called inside a `<TonConnectUIProvider>`. On the server side,
 * the hook returns a no-op pair — call sites can render shells
 * without crashing, but the real wiring only kicks in once the component
 * hydrates in the browser.
 *
 * @example
 * ```tsx
 * const [tonConnectUI, setOptions] = useTonConnectUI();
 *
 * await tonConnectUI.sendTransaction(tx, { traceId });
 * setOptions({ language: 'ru' });
 * ```
 */
export function useTonConnectUI(): [TonConnectUI, (options: TonConnectUiOptions) => void] {
    const tonConnectUI = useContext(TonConnectUIContext);
    const setOptions = useCallback(
        (options: TonConnectUiOptions) => {
            if (tonConnectUI) {
                tonConnectUI!.uiOptions = options;
            }
        },
        [tonConnectUI]
    );

    if (isServerSide()) {
        return [null as unknown as TonConnectUI, () => {}];
    }

    checkProvider(tonConnectUI);
    return [tonConnectUI!, setOptions];
}
