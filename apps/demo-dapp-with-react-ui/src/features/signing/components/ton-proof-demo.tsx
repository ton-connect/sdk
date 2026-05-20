import { useCallback, useEffect, useRef, useState } from 'react';
import { JsonView } from '../../../core/components/ui/json-view';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { ShieldCheck } from 'lucide-react';

import { Button } from '../../../core/components/ui/button/index';
import { EmptyState } from '../../../core/components/empty-state/index';
import { ResultPanel } from '../../../core/components/result-panel/index';
import { TonProofDemoApi } from '../../../core/lib/ton-proof-demo-api';
import useInterval from '../../../core/hooks/use-interval';

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
        return (
            <EmptyState
                icon={ShieldCheck}
                title="Authenticate to continue"
                description="Connect your wallet and approve the ton_proof challenge to call the demo backend."
                action={<Button onClick={() => tonConnectUI.openModal()}>Connect wallet</Button>}
            />
        );
    }

    return (
        <>
            <Button onClick={handleClick}>Call backend getAccountInfo()</Button>
            {data && Object.keys(data).length > 0 && (
                <ResultPanel title="Response">
                    <JsonView src={data} />
                </ResultPanel>
            )}
        </>
    );
};
