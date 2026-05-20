import { useEffect, useMemo, useRef } from 'react';

import { ButtonWithConnect } from '../../../../core/components/ui/button-with-connect';
import { CenteredAmountInput } from '../../../../core/components/ui/centered-amount-input';
import { Input } from '../../../../core/components/ui/input';
import { ResultBlock } from '../../../../core/components/ui/result-block';

import { useCreateJetton } from '../../hooks/use-create-jetton';
import { formatPresetSupply } from './lib/format-preset-supply';
import { JETTON_TICKER } from './lib/constants';
import { CreateJettonInfo } from './components/create-jetton-info';
import { SupplyBlock } from './components/supply-block';
import { useCreateJettonWallet } from './hooks/use-create-jetton-wallet';

export const CreateJettonDemo = () => {
    const { senderAddress, network, tonBalance, isTonBalanceLoading } = useCreateJettonWallet();
    const { preset, mint, sending, result, clearResult, canMint, needsTonProof } = useCreateJetton();

    const supplyDisplay = useMemo(
        () => formatPresetSupply(preset.amount, preset.decimals),
        [preset.amount, preset.decimals]
    );

    const resultRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!result || !resultRef.current) return;
        const rect = resultRef.current.getBoundingClientRect();
        if (rect.top < 0 || rect.bottom > window.innerHeight) {
            resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [result]);

    const sessionError = needsTonProof ? 'Ton proof required' : null;

    const canSend = !!senderAddress && canMint;

    const handleMint = async () => {
        if (!senderAddress || needsTonProof) return;
        await mint();
    };

    return (
        <div className="flex flex-col gap-4" data-testid="create-jetton">
            <div
                className="flex flex-col items-center gap-1 py-7"
                data-testid="create-jetton-amount-section"
            >
                <CenteredAmountInput
                    value={supplyDisplay}
                    onValueChange={() => {}}
                    ticker={JETTON_TICKER}
                    disabled
                    data-testid="create-jetton-amount-input"
                />
            </div>

            <SupplyBlock supply={supplyDisplay} testIdPrefix="create-jetton-supply" />

            <Input size="s" readOnly data-testid="create-jetton-name-field">
                <Input.Header>
                    <Input.Title data-testid="create-jetton-name-title">Jetton name</Input.Title>
                </Input.Header>
                <Input.Field>
                    <Input.Input value={preset.name} data-testid="create-jetton-name-input" />
                </Input.Field>
            </Input>

            <ButtonWithConnect
                size="l"
                fullWidth
                onClick={handleMint}
                loading={sending}
                disabled={!canSend}
                data-testid="create-jetton-mint-button"
            >
                {sessionError ?? 'Mint demo jetton'}
            </ButtonWithConnect>

            <CreateJettonInfo
                network={network}
                tonBalance={tonBalance}
                isTonBalanceLoading={isTonBalanceLoading}
                decimals={preset.decimals}
                testIdPrefix="create-jetton-info"
            />

            {result && (
                <ResultBlock
                    ref={resultRef}
                    title="Create jetton"
                    result={result}
                    onDismiss={clearResult}
                    testIdPrefix="create-jetton-result"
                />
            )}
        </div>
    );
};
