import { useEffect, useRef, useState } from 'react';
import { Address } from '@ton/core';

import { ButtonWithConnect } from '../../../../core/components/ui/button-with-connect';
import { CenteredAmountInput } from '../../../../core/components/ui/centered-amount-input';
import { Input } from '../../../../core/components/ui/input';
import { ResultBlock } from '../../../../core/components/shared/result-block';

import { BalanceBlock } from './components/balance-block';
import { TransferInfo } from './components/transfer-info';
import { USDT_TICKER } from './utils/constants';
import { useTransferUsdt, useUsdtWallet } from './hooks';

const DEFAULT_AMOUNT = '0.01';

const toUserFacingAddress = (raw: string): string =>
    Address.parse(raw).toString({ urlSafe: true, bounceable: false });

export const TransferUsdt = () => {
    const {
        senderAddress,
        network,
        chain,
        tonBalance,
        isTonBalanceLoading,
        usdtBalance,
        isUsdtBalanceLoading,
        jettonWallet,
        isJettonWalletLoading
    } = useUsdtWallet();
    const { send, sending, result, clearResult } = useTransferUsdt();

    const [amount, setAmount] = useState<string>(DEFAULT_AMOUNT);
    const [destination, setDestination] = useState<string>('');

    useEffect(() => {
        setDestination(senderAddress ? toUserFacingAddress(senderAddress) : '');
    }, [senderAddress]);

    // Scroll the most-recent result into view when a new one arrives.
    const resultRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!result || !resultRef.current) return;
        const rect = resultRef.current.getBoundingClientRect();
        if (rect.top < 0 || rect.bottom > window.innerHeight) {
            resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [result]);

    // Wallet connected, but on a chain we don't have a TonCenter endpoint or
    // USDT master for. Surface as an in-button error so the user can't dispatch.
    const networkError = network.isConnected && !chain ? 'Unsupported network' : null;

    const canSend =
        !!senderAddress && !!jettonWallet && !!destination && !!amount && !sending && !networkError;

    const handleSend = async () => {
        if (!senderAddress || !jettonWallet || !destination || networkError) return;
        await send({ senderAddress, destination, jettonWallet, amount });
    };

    const handleMax = () => {
        if (usdtBalance) setAmount(usdtBalance);
    };

    return (
        <div className="flex flex-col gap-4" data-testid="transfer-usdt">
            <div
                className="flex flex-col items-center gap-1 py-7"
                data-testid="transfer-usdt-amount-section"
            >
                <CenteredAmountInput
                    value={amount}
                    onValueChange={setAmount}
                    ticker={USDT_TICKER}
                    data-testid="transfer-usdt-amount-input"
                />
            </div>

            <BalanceBlock
                balance={usdtBalance}
                loading={isUsdtBalanceLoading}
                onMaxClick={handleMax}
                maxDisabled={isUsdtBalanceLoading || !usdtBalance}
                testIdPrefix="transfer-usdt-balance"
            />

            <Input size="s" data-testid="transfer-usdt-destination-field">
                <Input.Header>
                    <Input.Title data-testid="transfer-usdt-destination-title">
                        Destination
                    </Input.Title>
                </Input.Header>
                <Input.Field>
                    <Input.Input
                        value={destination}
                        onChange={e => setDestination(e.target.value)}
                        placeholder="EQAB…"
                        data-testid="transfer-usdt-destination-input"
                    />
                </Input.Field>
            </Input>

            <ButtonWithConnect
                size="l"
                fullWidth
                onClick={handleSend}
                loading={sending}
                disabled={!canSend}
                data-testid="transfer-usdt-send-button"
            >
                {networkError ?? 'Send USDT'}
            </ButtonWithConnect>

            <TransferInfo
                network={network}
                jettonWallet={jettonWallet}
                isJettonWalletLoading={isJettonWalletLoading}
                tonBalance={tonBalance}
                isTonBalanceLoading={isTonBalanceLoading}
                testIdPrefix="transfer-usdt-info"
            />

            {result && (
                <ResultBlock
                    ref={resultRef}
                    title="Transfer USDT"
                    result={result}
                    onDismiss={clearResult}
                    testIdPrefix="transfer-usdt-result"
                />
            )}
        </div>
    );
};
