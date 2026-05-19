import { useCallback, useEffect, useRef, useState } from 'react';
import ReactJson from 'react-json-view';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';

import { Button } from '@/core/components/ui/button';
import { TonProofDemoApi } from '@/core/lib/ton-proof-demo-api';
import useInterval from '@/core/hooks/use-interval';

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

                if (w.connectItems?.tonProof && 'proof' in w.connectItems.tonProof) {
                    await TonProofDemoApi.checkProof(w.connectItems.tonProof.proof, w.account);
                }

                if (!TonProofDemoApi.accessToken) {
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
        <div className="mt-[60px] flex w-full flex-col items-center gap-5 p-5">
            <h3 className="text-foreground/80">Demo backend API with ton_proof verification</h3>
            {authorized ? (
                <Button onClick={handleClick}>Call backend getAccountInfo()</Button>
            ) : (
                <div className="text-[18px] leading-5 text-primary">Connect wallet to call API</div>
            )}
            {data && Object.keys(data).length > 0 && (
                <>
                    <div className="mb-[6px] ml-[2px] mt-[18px] self-start text-[15px] font-medium tracking-[0.01em] text-secondary-foreground">
                        Response
                    </div>
                    <div className="w-full">
                        <ReactJson src={data} name={false} theme="ocean" collapsed={false} />
                    </div>
                </>
            )}
        </div>
    );
};
