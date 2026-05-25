import { WalletsModal, WalletsModalState } from '@tonconnect/ui';
import { useTonConnectUI } from './useTonConnectUI';
import { useEffect, useState } from 'react';

/**
 * Use it to get access to the open/close modal functions.
 *
 * Subscribes to `tonConnectUI.onModalStateChange` internally, so the
 * component re-renders whenever the modal opens, closes, or moves between
 * states. The returned `state` matches the latest reported value, or
 * `null` until the underlying instance is ready.
 *
 * @throws {@link TonConnectProviderNotSetError} when called on the client side without a `<TonConnectUIProvider>` ancestor.
 * @example
 * function ConnectCta() {
 *     const { state, open, close } = useTonConnectModal();
 *
 *     return (
 *         <button onClick={state?.status === 'opened' ? close : open}>
 *             {state?.status === 'opened' ? 'Close' : 'Connect wallet'}
 *         </button>
 *     );
 * }
 */
export function useTonConnectModal(): Omit<WalletsModal, 'onStateChange'> {
    const [tonConnectUI] = useTonConnectUI();
    const [state, setState] = useState(tonConnectUI?.modal.state || null);

    useEffect(() => {
        if (tonConnectUI) {
            setState(tonConnectUI.modal.state);
            return tonConnectUI.onModalStateChange((value: WalletsModalState) => {
                setState(value);
            });
        }
    }, [tonConnectUI]);

    return {
        state: state,
        open: () => tonConnectUI?.modal.open(),
        close: () => tonConnectUI?.modal.close()
    };
}
