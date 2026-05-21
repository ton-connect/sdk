import { useEffect, useRef } from 'react';

import { ButtonWithConnect } from '../../../../core/components/ui/button-with-connect/index';
import { RadioCards } from '../../../../core/components/ui/radio-cards';
import { ResultBlock } from '../../../../core/components/shared/result-block/index';

import { useMerkleDemo } from './hooks/use-merkle-demo';
import { MerkleContractInfo } from './components/merkle-contract-info';

export const Merkle = () => {
    const { mode, setMode, sending, result, send, clearResult, canSend } = useMerkleDemo();

    const resultRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!result || !resultRef.current) return;
        const rect = resultRef.current.getBoundingClientRect();
        if (rect.top < 0 || rect.bottom > window.innerHeight) {
            resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [result]);

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
