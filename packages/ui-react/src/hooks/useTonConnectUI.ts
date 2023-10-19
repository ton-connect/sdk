import { useCallback, useContext } from 'react';
import { TonConnectUIContext } from '../components/TonConnectUIProvider';
import { TonConnectUI, TonConnectUiOptions } from '@tonconnect/ui';
import { checkProvider } from '../utils/errors';
import { isServerSide } from '../utils/web';

/**
 * Use it to get access to the `TonConnectUI` instance and UI options updating function.
 */
export function useTonConnectUI(): [TonConnectUI, (options: TonConnectUiOptions) => void] {
    const tonConnectUI = useContext(TonConnectUIContext);
    const setOptions = useCallback(
        (options: TonConnectUiOptions) => {
            if (tonConnectUI) {
                try {
                    tonConnectUI!.uiOptions = options;
                } catch (e) {
                    console.log(`Error while updating TonConnectUI options: ${e}`);
                    throw e;
                }
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
