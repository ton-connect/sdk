import { useEffect, useRef } from 'react';
import { ShieldCheck } from 'lucide-react';

import { Button } from '../../../core/components/ui/button/index';
import { ButtonWithConnect } from '../../../core/components/ui/button-with-connect/index';
import { ResultBlock } from '../../../core/components/ui/result-block/index';
import { EmptyState } from '../../../core/components/empty-state/index';

import { useAccountInfo, useTonProofAuth } from '../hooks';
import { TonProofAuthInfo } from './ton-proof-auth-info';

export const TonProofDemo = () => {
    const { authorized, wallet, openConnectModal, reconnectForProof } = useTonProofAuth();
    const { loading, result, fetchAccountInfo, clearResult } = useAccountInfo();

    const resultRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!result || !resultRef.current) return;
        const rect = resultRef.current.getBoundingClientRect();
        if (rect.top < 0 || rect.bottom > window.innerHeight) {
            resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [result]);

    if (!authorized) {
        const needsReconnect = !!wallet;

        return (
            <EmptyState
                icon={ShieldCheck}
                title={needsReconnect ? 'Ton proof required' : 'Authenticate to continue'}
                description={
                    needsReconnect
                        ? 'Your wallet is connected to the dapp, but this demo still needs a ton_proof signature for the backend session. Reconnect and approve the challenge in the wallet.'
                        : 'Connect your wallet and approve the ton_proof challenge. The demo backend verifies the signature before you can call protected APIs.'
                }
                action={
                    <Button
                        onClick={needsReconnect ? () => void reconnectForProof() : openConnectModal}
                        data-testid={
                            needsReconnect
                                ? 'ton-proof-reconnect-button'
                                : 'ton-proof-connect-button'
                        }
                    >
                        {needsReconnect ? 'Reconnect wallet' : 'Connect wallet'}
                    </Button>
                }
                data-testid="ton-proof-unauthenticated"
            />
        );
    }

    return (
        <div className="flex w-full flex-col gap-4" data-testid="ton-proof-demo">
            {wallet && <TonProofAuthInfo account={wallet.account} />}

            <div className="flex flex-wrap justify-center gap-3">
                <ButtonWithConnect
                    onClick={() => void fetchAccountInfo()}
                    loading={loading}
                    disabled={loading}
                    data-testid="ton-proof-fetch-account-info-button"
                >
                    Get account info
                </ButtonWithConnect>
            </div>

            {result && (
                <ResultBlock
                    ref={resultRef}
                    title="Account info"
                    result={result}
                    onDismiss={clearResult}
                    testIdPrefix="ton-proof-account-info"
                />
            )}
        </div>
    );
};
