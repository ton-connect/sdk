import { useEffect, useRef, useState } from 'react';
import { Address } from '@ton/core';

import { ButtonWithConnect } from '../../../../core/components/ui/button-with-connect';
import { CenteredAmountInput } from '../../../../core/components/ui/centered-amount-input';
import { Input } from '../../../../core/components/ui/input';
import { ResultBlock } from '../../../../core/components/shared/result-block';
import { SettingsButton } from '../../../../core/components/ui/settings-button';

import { BalanceBlock } from './components/balance-block';
import { TransferInfo } from './components/transfer-info';
import { TransferSettingsModal } from './components/transfer-settings-modal';
import { USDT_TICKER } from './utils/constants';
import { useTransferForm, useTransferUsdt, useUsdtWallet } from './hooks';

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
    const form = useTransferForm();
    const { send, sending, result, clearResult } = useTransferUsdt();

    const [amount, setAmount] = useState<string>(DEFAULT_AMOUNT);
    const [destination, setDestination] = useState<string>('');
    const [settingsOpen, setSettingsOpen] = useState(false);

    useEffect(() => {
        setDestination(senderAddress ? toUserFacingAddress(senderAddress) : '');
    }, [senderAddress]);

    const resultRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!result || !resultRef.current) return;
        const rect = resultRef.current.getBoundingClientRect();
        if (rect.top < 0 || rect.bottom > window.innerHeight) {
            resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [result]);

    const networkError = form.gasless
        ? network.isConnected && !network.isMainnet
            ? 'Unsupported network'
            : null
        : network.isConnected && !chain
          ? 'Unsupported network'
          : null;

    const canSend =
        !!senderAddress &&
        !!destination &&
        !!amount &&
        !sending &&
        !networkError &&
        (form.gasless || !!jettonWallet);

    const handleSend = async () => {
        if (!senderAddress || !destination || networkError) return;
        if (!form.gasless && !jettonWallet) return;
        await send({
            senderAddress,
            destination,
            jettonWallet: jettonWallet ?? '',
            amount,
            gasless: form.gasless,
            gaslessMode: form.gaslessMode,
            withConnect: form.withConnect
        });
    };

    const handleMax = () => {
        if (usdtBalance) setAmount(usdtBalance);
    };

    const buttonLabel = networkError ? networkError : form.gasless ? 'Send gasless' : 'Send USDT';
    const resultTitle = form.gasless ? 'Gasless USDT' : 'Transfer USDT';

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

            <div className="flex items-stretch gap-2">
                <ButtonWithConnect
                    size="l"
                    fullWidth
                    onClick={handleSend}
                    loading={sending}
                    disabled={!canSend}
                    skipConnectPrompt={form.withConnect}
                    data-testid="transfer-usdt-send-button"
                >
                    {buttonLabel}
                </ButtonWithConnect>
                <SettingsButton
                    onClick={() => setSettingsOpen(true)}
                    data-testid="transfer-usdt-settings-button"
                />
            </div>

            <TransferSettingsModal
                open={settingsOpen}
                onOpenChange={setSettingsOpen}
                gasless={form.gasless}
                onGaslessChange={form.setGasless}
                gaslessMode={form.gaslessMode}
                onGaslessModeChange={form.setGaslessMode}
                withConnect={form.withConnect}
                onWithConnectChange={form.setWithConnect}
            />

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
                    title={resultTitle}
                    result={result}
                    onDismiss={clearResult}
                    testIdPrefix="transfer-usdt-result"
                />
            )}
        </div>
    );
};
