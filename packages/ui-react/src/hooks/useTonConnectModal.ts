import { WalletsModal, WalletsModalState } from '@tonconnect/ui';
import { useTonConnectUI } from './useTonConnectUI';
import { useEffect, useState } from 'react';

/**
 * Reactive wrapper around `tonConnectUI.modal`. Returns `{ state, open,
 * close }` — `state` mirrors `WalletsModalState` and re-renders on every
 * modal lifecycle event; `open` / `close` are convenience bindings.
 *
 * Must be called inside a `<TonConnectUIProvider>`. Use this hook when the
 * dApp wants its own "Connect" UI separate from `<TonConnectButton />`.
 *
 * @example
 * ```tsx
 * const { state, open, close } = useTonConnectModal();
 *
 * return (
 *     <>
 *         <div>Modal status: {state?.status}</div>
 *         <button onClick={open}>Open modal</button>
 *         <button onClick={close}>Close modal</button>
 *     </>
 * );
 * ```
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
