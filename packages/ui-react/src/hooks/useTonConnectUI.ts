import { useCallback, useContext } from 'react';
import { TonConnectUIContext } from '../components/TonConnectUIProvider';
import { TonConnectUI, TonConnectUiOptions } from '@tonconnect/ui';
import { checkProvider } from '../utils/errors';
import { isServerSide } from '../utils/web';

/**
 * Use it to get access to the `TonConnectUI` instance and UI options updating function.
 *
 * The returned tuple is stable across renders. `setOptions` merges into
 * `tonConnectUI.uiOptions`; call it to switch language, theme, return
 * strategy, or other UI preferences at runtime.
 *
 * @throws {@link TonConnectProviderNotSetError} when called on the client side without a `<TonConnectUIProvider>` ancestor. On the server side the hook returns a no-op tuple instead.
 * @example
 * function ConnectButton() {
 *     const [tonConnectUI, setOptions] = useTonConnectUI();
 *
 *     return (
 *         <>
 *             <button onClick={() => tonConnectUI.openModal()}>Connect</button>
 *             <button onClick={() => setOptions({ language: 'ru' })}>Switch to RU</button>
 *         </>
 *     );
 * }
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
