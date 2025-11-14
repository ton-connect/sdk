import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactJson from 'react-json-view';
import './style.scss';
import { TonProofDemoApi } from '../../TonProofDemoApi';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import useInterval from '../../hooks/useInterval';

export const TonProofDemo = () => {
    const firstProofLoading = useRef<boolean>(true);

    const [data, setData] = useState({});
    const wallet = useTonWallet();
    const [authorized, setAuthorized] = useState(false);
    const [tonConnectUI] = useTonConnectUI();

    const recreateProofPayload = useCallback(async () => {
        if (firstProofLoading.current) {
            tonConnectUI.setConnectRequestParameters({ state: 'loading' });
            firstProofLoading.current = false;
        }

        const payload = await TonProofDemoApi.generatePayload();

        if (payload) {
            tonConnectUI.setConnectRequestParameters({ state: 'ready', value: payload });
        } else {
            tonConnectUI.setConnectRequestParameters(null);
        }
    }, [tonConnectUI, firstProofLoading]);

    if (firstProofLoading.current) {
        recreateProofPayload();
    }

    useInterval(recreateProofPayload, TonProofDemoApi.refreshIntervalMs);

    useEffect(
        () =>
            tonConnectUI.onStatusChange(async w => {
                if (!w) {
                    TonProofDemoApi.reset();
                    setAuthorized(false);
                    return;
                }

                if (!w.connectItems?.tonProof || !('proof' in w.connectItems.tonProof)) {
                    console.debug('[TonProofDemo] Proof is required, disconnecting');
                    tonConnectUI.disconnect();
                    setAuthorized(false);
                    return;
                }

                await TonProofDemoApi.checkProof(w.connectItems.tonProof.proof, w.account);
                if (!TonProofDemoApi.accessToken) {
                    console.debug('[TonProofDemo] Proof validation failed, disconnecting');
                    tonConnectUI.disconnect();
                    setAuthorized(false);
                    return;
                }

                setAuthorized(true);
            }),
        [tonConnectUI]
    );

    const handleClick = useCallback(async () => {
        if (!wallet) {
            return;
        }
        const response = await TonProofDemoApi.getAccountInfo(wallet.account);

        setData(response);
    }, [wallet]);

    if (!authorized) {
        return null;
    }

    return (
        <div className="ton-proof-demo">
            <h3>Demo backend API with ton_proof verification</h3>
            {authorized ? (
                <button onClick={handleClick}>Call backend getAccountInfo()</button>
            ) : (
                <div className="ton-proof-demo__error">Connect wallet to call API</div>
            )}
            {data && Object.keys(data).length > 0 && (
                <>
                    <div className="find-transaction-demo__json-label">Response</div>
                    <div className="find-transaction-demo__json-view">
                        <ReactJson src={data} name={false} theme="ocean" collapsed={false} />
                    </div>
                </>
            )}
        </div>
    );
};
