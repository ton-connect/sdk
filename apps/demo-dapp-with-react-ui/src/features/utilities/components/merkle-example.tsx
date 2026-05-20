import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Wallet } from 'lucide-react';

import { Button } from '../../../core/components/ui/button/index';
import { ButtonWithConnect } from '../../../core/components/ui/button-with-connect/index';
import { RadioCards } from '../../../core/components/ui/radio-cards';
import { ResultBlock } from '../../../core/components/ui/result-block/index';
import { EmptyState } from '../../../core/components/empty-state/index';

import { useMerkleDemo } from '../hooks';
import { MerkleContractInfo } from './merkle-contract-info';

export const MerkleExample = () => {
    const navigate = useNavigate();
    const { wallet, mode, setMode, sending, result, send, clearResult, canSend, needsTonProof } =
        useMerkleDemo();

    const resultRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!result || !resultRef.current) return;
        const rect = resultRef.current.getBoundingClientRect();
        if (rect.top < 0 || rect.bottom > window.innerHeight) {
            resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [result]);

    if (!wallet) {
        return (
            <EmptyState
                icon={Wallet}
                title="Connect a wallet"
                description="Connect a wallet to send a merkle proof deploy transaction or a merkle update to the example contract."
                action={
                    <ButtonWithConnect data-testid="merkle-connect-button">
                        Connect wallet
                    </ButtonWithConnect>
                }
                data-testid="merkle-unconnected"
            />
        );
    }

    if (needsTonProof) {
        return (
            <EmptyState
                icon={ShieldCheck}
                title="Ton proof required"
                description="Merkle proof is built by the protected demo backend. Complete ton_proof authentication on the Ton proof page, then return here."
                action={
                    <Button
                        onClick={() => navigate('/ton-proof')}
                        data-testid="merkle-go-ton-proof-button"
                    >
                        Go to Ton proof
                    </Button>
                }
                data-testid="merkle-needs-ton-proof"
            />
        );
    }

    const actionLabel = mode === 'proof' ? 'Send merkle proof' : 'Send merkle update';
    const resultTitle = mode === 'proof' ? 'Merkle proof' : 'Merkle update';

    return (
        <div className="flex w-full flex-col gap-4" data-testid="merkle-demo">
            <RadioCards value={mode} onChange={setMode} data-testid="merkle-mode">
                <RadioCards.Item value="proof" data-testid="merkle-mode-proof">
                    Merkle proof
                    <RadioCards.Tag>Deploy + proof</RadioCards.Tag>
                </RadioCards.Item>
                <RadioCards.Item value="update" data-testid="merkle-mode-update">
                    Merkle update
                    <RadioCards.Tag>Example contract</RadioCards.Tag>
                </RadioCards.Item>
            </RadioCards>

            {mode === 'update' && <MerkleContractInfo />}

            <ButtonWithConnect
                size="l"
                fullWidth
                onClick={() => void send()}
                loading={sending}
                disabled={!canSend}
                data-testid="merkle-send-button"
            >
                {actionLabel}
            </ButtonWithConnect>

            {result && (
                <ResultBlock
                    ref={resultRef}
                    title={resultTitle}
                    result={result}
                    onDismiss={clearResult}
                    testIdPrefix="merkle-result"
                />
            )}
        </div>
    );
};
