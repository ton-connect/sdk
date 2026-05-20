import { useEffect, useRef, useState } from 'react';
import { Address } from '@ton/core';
import { CHAIN } from '@tonconnect/ui-react';

import { ButtonWithConnect } from '../../../../core/components/ui/button-with-connect';
import { CenteredAmountInput } from '../../../../core/components/ui/centered-amount-input';
import { Input } from '../../../../core/components/ui/input';
import { RadioCards } from '../../../../core/components/ui/radio-cards';
import { ResultBlock } from '../../../../core/components/ui/result-block';

import { BalanceBlock } from '../transfer-usdt/components/balance-block';
import { TransferInfo } from '../transfer-usdt/components/transfer-info';
import { useUsdtWallet } from '../transfer-usdt/hooks';
import { USDT_TICKER } from '../transfer-usdt/lib/constants';

import { useGasless, type GaslessMode } from './hooks';

const DEFAULT_AMOUNT = '0.05';

const toUserFacingAddress = (raw: string): string =>
    Address.parse(raw).toString({ urlSafe: true, bounceable: false });

export const Gasless = () => {
    const {
        senderAddress,
        chain,
        rawChain,
        isWalletConnected,
        tonBalance,
        isTonBalanceLoading,
        usdtBalance,
        isUsdtBalanceLoading,
        jettonWallet,
        isJettonWalletLoading
    } = useUsdtWallet();
    const { send, sending, result, clearResult } = useGasless();

    const [amount, setAmount] = useState<string>(DEFAULT_AMOUNT);
    const [destination, setDestination] = useState<string>('');
    const [mode, setMode] = useState<GaslessMode>('messages');

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

    // The gasless lib pins the USDT master to mainnet, so testnet (or any
    // other chain) is not supported.
    const networkError =
        isWalletConnected && chain !== CHAIN.MAINNET
            ? chain === undefined
                ? 'Unsupported network'
                : 'Mainnet only'
            : null;

    const canSend = !!senderAddress && !!destination && !!amount && !sending && !networkError;

    const handleSend = async () => {
        if (!senderAddress || !destination || networkError) return;
        await send({ mode, destination, amount });
    };

    const handleMax = () => {
        if (usdtBalance) setAmount(usdtBalance);
    };

    return (
        <div className="flex flex-col gap-4" data-testid="gasless">
            <div
                className="flex flex-col items-center gap-1 py-7"
                data-testid="gasless-amount-section"
            >
                <CenteredAmountInput
                    value={amount}
                    onValueChange={setAmount}
                    ticker={USDT_TICKER}
                    data-testid="gasless-amount-input"
                />
            </div>

            <BalanceBlock
                balance={usdtBalance}
                loading={isUsdtBalanceLoading}
                onMaxClick={handleMax}
                maxDisabled={isUsdtBalanceLoading || !usdtBalance}
            />

            <Input size="s" data-testid="gasless-destination-field">
                <Input.Header>
                    <Input.Title data-testid="gasless-destination-title">Destination</Input.Title>
                </Input.Header>
                <Input.Field>
                    <Input.Input
                        value={destination}
                        onChange={e => setDestination(e.target.value)}
                        placeholder="EQAB…"
                        data-testid="gasless-destination-input"
                    />
                </Input.Field>
            </Input>

            <RadioCards value={mode} onChange={setMode} data-testid="gasless-mode">
                <RadioCards.Item value="messages">
                    Messages
                    <RadioCards.Tag>Default</RadioCards.Tag>
                </RadioCards.Item>
                <RadioCards.Item value="items">
                    Items
                    <RadioCards.Tag>Structured</RadioCards.Tag>
                </RadioCards.Item>
            </RadioCards>

            <ButtonWithConnect
                size="l"
                fullWidth
                onClick={handleSend}
                loading={sending}
                disabled={!canSend}
                data-testid="gasless-send-button"
            >
                {networkError ?? 'Send gasless'}
            </ButtonWithConnect>

            <TransferInfo
                chain={chain}
                rawChain={rawChain}
                jettonWallet={jettonWallet}
                isJettonWalletLoading={isJettonWalletLoading}
                tonBalance={tonBalance}
                isTonBalanceLoading={isTonBalanceLoading}
            />

            {result && (
                <ResultBlock
                    ref={resultRef}
                    title="Gasless USDT"
                    result={result}
                    onDismiss={clearResult}
                    testIdPrefix="gasless-result"
                />
            )}
        </div>
    );
};
