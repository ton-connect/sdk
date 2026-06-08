import { useEffect, useRef } from 'react';

import { ButtonWithConnect } from '../../../../core/components/ui/button-with-connect';
import { JsonEditor } from '../../../../core/components/ui/json-editor';
import { ResultBlock } from '../../../../core/components/shared/result-block';

import { useCreateJetton } from './hooks/use-create-jetton';
import { ConfigureHeader } from './components/configure-header';
import { CreateJettonInfo } from './components/create-jetton-info';
import { JettonPreview } from './components/jetton-preview';
import { useCreateJettonForm } from './hooks/use-create-jetton-form';
import { useCreateJettonWallet } from './hooks/use-create-jetton-wallet';

export const CreateJetton = () => {
    const { senderAddress, network, tonBalance, isTonBalanceLoading } = useCreateJettonWallet();
    const { mint, sending, result, clearResult, canMint } = useCreateJetton();
    const form = useCreateJettonForm();

    const resultRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!result || !resultRef.current) return;
        const rect = resultRef.current.getBoundingClientRect();
        if (rect.top < 0 || rect.bottom > window.innerHeight) {
            resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [result]);

    const disableAction = !senderAddress || !canMint || form.isSendBlocked || sending;

    const handleMint = async () => {
        if (!senderAddress || form.isSendBlocked) return;
        await mint(form.jetton);
    };

    return (
        <div className="flex w-full flex-col gap-2" data-testid="create-jetton">
            <ConfigureHeader onReset={form.reset} />

            <JsonEditor
                className="mb-2"
                value={form.draft}
                onChange={form.onDraftChange}
                invalid={form.showInvalidUi}
                messages={form.editorMessages}
                data-testid="create-jetton-json-editor"
            />

            <h3
                className="pl-1 text-lg font-semibold text-foreground"
                data-testid="create-jetton-preview-title"
            >
                Preview
            </h3>

            <JettonPreview jetton={form.jetton} testIdPrefix="create-jetton-preview" />

            <ButtonWithConnect
                size="l"
                fullWidth
                onClick={handleMint}
                loading={sending}
                disabled={disableAction}
                data-testid="create-jetton-mint-button"
            >
                Mint jetton
            </ButtonWithConnect>

            <CreateJettonInfo
                network={network}
                tonBalance={tonBalance}
                isTonBalanceLoading={isTonBalanceLoading}
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
