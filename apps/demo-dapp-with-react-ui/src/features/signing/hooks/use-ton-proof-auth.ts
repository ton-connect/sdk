import { useCallback, useEffect, useRef, useState } from 'react';
import type { Wallet } from '@tonconnect/ui-react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';

import { TonProofDemoApi } from '../../../core/lib/ton-proof-demo-api';
import useInterval from '../../../core/hooks/use-interval';

/**
 * Keeps ton_proof connect parameters fresh and verifies the wallet proof against
 * the demo backend on each connect. Restores backend session when the JWT in
 * storage matches the connected wallet (onStatusChange does not replay on mount).
 */
export function useTonProofAuth() {
    const firstPayloadLoad = useRef(true);
    const [authorized, setAuthorized] = useState(false);
    const wallet = useTonWallet();
    const [tonConnectUI] = useTonConnectUI();

    const refreshConnectPayload = useCallback(async () => {
        if (firstPayloadLoad.current) {
            tonConnectUI.setConnectRequestParameters({ state: 'loading' });
            firstPayloadLoad.current = false;
        }

        const payload = await TonProofDemoApi.generatePayload();

        if (payload) {
            tonConnectUI.setConnectRequestParameters({ state: 'ready', value: payload });
        } else {
            tonConnectUI.setConnectRequestParameters(null);
        }
    }, [tonConnectUI]);

    useEffect(() => {
        void refreshConnectPayload();
    }, [refreshConnectPayload]);

    useInterval(refreshConnectPayload, TonProofDemoApi.refreshIntervalMs);

    const processWallet = useCallback(
        async (w: Wallet | null) => {
            if (!w) {
                TonProofDemoApi.reset();
                setAuthorized(false);
                return;
            }

            if (TonProofDemoApi.sessionMatchesAccount(w.account)) {
                setAuthorized(true);
                return;
            }

            if (w.connectItems?.tonProof && 'proof' in w.connectItems.tonProof) {
                await TonProofDemoApi.checkProof(w.connectItems.tonProof.proof, w.account);

                if (TonProofDemoApi.sessionMatchesAccount(w.account)) {
                    setAuthorized(true);
                    return;
                }

                TonProofDemoApi.reset();
                setAuthorized(false);
                tonConnectUI.disconnect();
                return;
            }

            if (TonProofDemoApi.accessToken) {
                TonProofDemoApi.reset();
            }
            setAuthorized(false);
        },
        [tonConnectUI]
    );

    useEffect(() => {
        return tonConnectUI.onStatusChange(w => {
            void processWallet(w);
        });
    }, [tonConnectUI, processWallet]);

    useEffect(() => {
        void processWallet(wallet);
    }, [wallet, processWallet]);

    const openConnectModal = useCallback(() => {
        tonConnectUI.openModal();
    }, [tonConnectUI]);

    const reconnectForProof = useCallback(async () => {
        if (wallet) {
            await tonConnectUI.disconnect();
        }
        tonConnectUI.openModal();
    }, [tonConnectUI, wallet]);

    const signOut = useCallback(async () => {
        await tonConnectUI.disconnect();
    }, [tonConnectUI]);

    return { authorized, wallet, openConnectModal, reconnectForProof, signOut };
}
