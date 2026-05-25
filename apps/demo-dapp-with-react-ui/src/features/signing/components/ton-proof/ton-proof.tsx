import { useEffect, useRef } from 'react';
import { ShieldCheck } from 'lucide-react';

import { Button } from '../../../../core/components/ui/button/index';
import { ButtonWithConnect } from '../../../../core/components/ui/button-with-connect/index';
import { ResultBlock } from '../../../../core/components/shared/result-block/index';
import { EmptyState } from '../../../../core/components/shared/empty-state/index';
import { useWalletNetwork } from '../../../../core/hooks/use-wallet-network';

import { useAccountInfo } from './hooks/use-account-info';
import { useTonProofAuth } from './hooks/use-ton-proof-auth';
import { TonProofAuthInfo } from './components/ton-proof-auth-info';

export const TonProof = () => {
    const { authorized, wallet, openConnectModal, reconnectForProof } = useTonProofAuth();
    const { loading, result, fetchAccountInfo, clearResult } = useAccountInfo();
    const network = useWalletNetwork();

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
            {wallet && <TonProofAuthInfo account={wallet.account} network={network} />}

            <ButtonWithConnect
                size="l"
                fullWidth
                onClick={() => void fetchAccountInfo()}
                loading={loading}
                disabled={loading}
                data-testid="ton-proof-action-button"
            >
                Get account info
            </ButtonWithConnect>

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
