import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Address } from '@ton/core';

import { ResultBlock } from '../../../../core/components/shared/result-block';
import { useQaMode } from '../../../../core/hooks/use-qa-mode';
import {
    sanitizeDecimalAmountInput,
    validateAmountWithinBalance,
    validatePositiveDecimalAmount
} from '../../../../core/utils/validation';

import { AmountSection } from './components/amount-section';
import { BalanceBlock } from './components/balance-block';
import { DestinationInput } from './components/destination-input';
import { TransferActions } from './components/transfer-actions';
import { TransferInfo } from './components/transfer-info';
import { TransferSettingsModal } from './components/transfer-settings-modal';
import { useTransferForm, useTransferUsdt, useUsdtWallet } from './hooks';
import { USDT_DECIMALS } from './utils/constants';

const DEFAULT_AMOUNT = '0.01';

const toUserFacingAddress = (raw: string): string =>
    Address.parse(raw).toString({ urlSafe: true, bounceable: false });

// eslint-disable-next-line complexity
export const TransferUsdt = () => {
    const qaMode = useQaMode();
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

    const formatError = useMemo(
        () => validatePositiveDecimalAmount(amount, { maxDecimals: USDT_DECIMALS }),
        [amount]
    );

    const balanceError = useMemo(() => {
        if (formatError || isUsdtBalanceLoading || !senderAddress || !usdtBalance) {
            return null;
        }
        return validateAmountWithinBalance(amount, usdtBalance, USDT_DECIMALS);
    }, [amount, formatError, isUsdtBalanceLoading, senderAddress, usdtBalance]);

    const amountError = formatError ?? balanceError;
    const amountSendBlocked = qaMode ? null : amountError;

    const handleAmountChange = useCallback((next: string) => {
        setAmount(sanitizeDecimalAmountInput(next, USDT_DECIMALS));
    }, []);

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
        !!destination &&
        !!amount &&
        !amountSendBlocked &&
        !sending &&
        !networkError &&
        (form.withConnect ||
            (!!senderAddress && (form.gasless || form.gaslessMode === 'items' || !!jettonWallet)));

    const handleSend = async () => {
        if (!destination || amountSendBlocked || networkError) return;
        if (!form.withConnect && !senderAddress) return;
        if (!form.gasless && !form.withConnect && !jettonWallet && form.gaslessMode !== 'items') {
            return;
        }
        await send({
            senderAddress: senderAddress ?? '',
            destination,
            jettonWallet: jettonWallet ?? '',
            amount,
            gasless: form.gasless,
            gaslessMode: form.gaslessMode,
            withConnect: form.withConnect,
            chain
        });
    };

    const handleMax = () => {
        if (usdtBalance) setAmount(usdtBalance);
    };

    const buttonLabel = networkError ? networkError : form.gasless ? 'Send gasless' : 'Send USDT';
    const resultTitle = form.gasless ? 'Gasless USDT' : 'Transfer USDT';

    return (
        <div className="flex flex-col gap-4" data-testid="transfer-usdt">
            <AmountSection
                value={amount}
                onChange={handleAmountChange}
                errorMessage={amountError}
            />

            <BalanceBlock
                balance={usdtBalance}
                loading={isUsdtBalanceLoading}
                onMaxClick={handleMax}
                maxDisabled={isUsdtBalanceLoading || !usdtBalance}
                testIdPrefix="transfer-usdt-balance"
            />

            <DestinationInput value={destination} onChange={setDestination} />

            <TransferActions
                label={buttonLabel}
                onSend={handleSend}
                onSettingsClick={() => setSettingsOpen(true)}
                sending={sending}
                disabled={!canSend}
                skipConnectPrompt={form.withConnect}
            />

            <TransferInfo
                network={network}
                jettonWallet={jettonWallet}
                isJettonWalletLoading={isJettonWalletLoading}
                tonBalance={tonBalance}
                isTonBalanceLoading={isTonBalanceLoading}
                testIdPrefix="transfer-usdt-info"
            />

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
