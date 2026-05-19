import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    CHAIN,
    useIsConnectionRestored,
    useTonConnectUI,
    useTonWallet
} from '@tonconnect/ui-react';
import { fromNano, toNano } from '@ton/core';

import {
    PRESETS,
    type AmountUnit,
    type PresetKey,
    type TransactionMessage
} from '../lib/transaction-presets';

export interface OperationResult {
    id: string;
    timestamp: number;
    requestSnapshot: string;
    response: string;
    status: 'success' | 'error';
    errorMessage?: string;
    boc?: string;
    validUntil?: number;
}

const DEFAULT_ADDRESS = 'EQCKWpx7cNMpvmcN5ObM5lLUZHZRFKqYA4xmw9jOry0ZsF9M';

export function useTransaction() {
    const [tonConnectUI] = useTonConnectUI();
    const wallet = useTonWallet();
    const isConnectionRestored = useIsConnectionRestored();

    const [validUntil, setValidUntil] = useState(
        () => Math.floor(Date.now() / 1000) + 86400
    );
    const [network, setNetwork] = useState('');
    const [from, setFrom] = useState('');
    const [messages, setMessages] = useState<TransactionMessage[]>([
        { address: DEFAULT_ADDRESS, amount: '5000000', stateInit: '', payload: '' }
    ]);

    const [amountUnits, setAmountUnits] = useState<Record<number, AmountUnit>>({});
    const [requestJson, setRequestJson] = useState('');
    const [lastResult, setLastResult] = useState<OperationResult | null>(null);
    const [isSending, setIsSending] = useState(false);

    const setValidUntilFromNow = useCallback((seconds: number) => {
        setValidUntil(Math.floor(Date.now() / 1000) + seconds);
    }, []);

    const reset = useCallback(() => {
        setValidUntil(Math.floor(Date.now() / 1000) + 86400);
        setNetwork('');
        setFrom('');
        setMessages([
            { address: DEFAULT_ADDRESS, amount: '5000000', stateInit: '', payload: '' }
        ]);
        setAmountUnits({});
        setLastResult(null);
    }, []);

    const getDisplayAmount = useCallback(
        (index: number): string => {
            const unit = amountUnits[index] || 'TON';
            const nanoAmount = messages[index]?.amount || '0';
            if (unit === 'TON') return fromNano(nanoAmount);
            return nanoAmount;
        },
        [messages, amountUnits]
    );

    const setMessageAmount = useCallback(
        (index: number, displayValue: string, unit: AmountUnit) => {
            const updated = [...messages];
            try {
                const nanoValue =
                    unit === 'TON' ? toNano(displayValue || '0').toString() : displayValue;
                updated[index] = { ...updated[index], amount: nanoValue };
                setMessages(updated);
            } catch {
                // invalid number — ignore
            }
        },
        [messages]
    );

    const getAmountUnit = useCallback(
        (index: number): AmountUnit => amountUnits[index] || 'TON',
        [amountUnits]
    );

    const setAmountUnit = useCallback((index: number, unit: AmountUnit) => {
        setAmountUnits(prev => ({ ...prev, [index]: unit }));
    }, []);

    const walletNetwork = useMemo(
        () =>
            isConnectionRestored && wallet?.account?.chain
                ? String(wallet.account.chain)
                : '',
        [isConnectionRestored, wallet?.account?.chain]
    );

    useEffect(() => {
        const builtMessages = messages.map(msg => {
            const m: Record<string, string> = { address: msg.address, amount: msg.amount };
            if (msg.stateInit) m.stateInit = msg.stateInit;
            if (msg.payload) m.payload = msg.payload;
            return m;
        });

        const effectiveNetwork = network || walletNetwork;
        const tx: Record<string, unknown> = { validUntil, messages: builtMessages };
        if (effectiveNetwork) tx.network = effectiveNetwork;
        if (from) tx.from = from;

        setRequestJson(JSON.stringify(tx, null, 2));
    }, [validUntil, network, from, messages, walletNetwork]);

    const loadPreset = (key: PresetKey) => {
        const preset = PRESETS[key];
        setValidUntil(Math.floor(Date.now() / 1000) + preset.validUntil);
        setNetwork('');
        setFrom(preset.from);
        setMessages(
            preset.messages.map(msg => ({
                address: msg.address,
                amount: msg.amount,
                stateInit: '',
                payload: 'payload' in msg ? (msg as { payload: string }).payload : ''
            }))
        );
        setAmountUnits({});
    };

    const addMessage = () => {
        setMessages([
            ...messages,
            { address: '', amount: toNano('0.001').toString(), stateInit: '', payload: '' }
        ]);
    };

    const removeMessage = (index: number) => {
        if (messages.length > 1) setMessages(messages.filter((_, i) => i !== index));
    };

    const updateMessage = (index: number, field: keyof TransactionMessage, value: string) => {
        const updated = [...messages];
        updated[index] = { ...updated[index], [field]: value };
        setMessages(updated);
    };

    const setFromJson = useCallback((json: string) => {
        try {
            const data = JSON.parse(json);
            if (data.validUntil) setValidUntil(data.validUntil);
            if (data.network !== undefined) setNetwork(data.network);
            if (data.from !== undefined) setFrom(data.from);
            if (Array.isArray(data.messages)) {
                setMessages(
                    data.messages.map((msg: Record<string, string>) => ({
                        address: msg.address || '',
                        amount: msg.amount || '0',
                        stateInit: msg.stateInit || '',
                        payload: msg.payload || ''
                    }))
                );
                const newUnits: Record<number, AmountUnit> = {};
                data.messages.forEach((_: unknown, i: number) => {
                    newUnits[i] = 'nano';
                });
                setAmountUnits(newUnits);
            }
        } catch {
            // invalid json — ignore
        }
    }, []);

    const send = async () => {
        if (!wallet) return;

        const builtMessages = messages.map(msg => {
            const m: Record<string, string> = { address: msg.address, amount: msg.amount };
            if (msg.stateInit) m.stateInit = msg.stateInit;
            if (msg.payload) m.payload = msg.payload;
            return m;
        });

        const requestSnapshot = requestJson;
        const txValidUntil = validUntil;

        setIsSending(true);
        try {
            const result = await tonConnectUI.sendTransaction({
                validUntil: txValidUntil,
                messages: builtMessages as Array<{
                    address: string;
                    amount: string;
                    stateInit?: string;
                    payload?: string;
                }>
            });
            setLastResult({
                id: crypto.randomUUID(),
                timestamp: Date.now(),
                requestSnapshot,
                response: JSON.stringify(result, null, 2),
                status: 'success',
                boc: result.boc,
                validUntil: txValidUntil
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Transaction failed';
            setLastResult({
                id: crypto.randomUUID(),
                timestamp: Date.now(),
                requestSnapshot,
                response: JSON.stringify({ error: message }, null, 2),
                status: 'error',
                errorMessage: message
            });
            // eslint-disable-next-line no-console
            console.error('sendTransaction failed', error);
        } finally {
            setIsSending(false);
        }
    };

    const sendRaw = async (rawJson: string) => {
        if (!wallet) return;

        let data: { validUntil?: number; messages?: Record<string, string>[] };
        try {
            data = JSON.parse(rawJson);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Invalid JSON';
            setLastResult({
                id: crypto.randomUUID(),
                timestamp: Date.now(),
                requestSnapshot: rawJson,
                response: JSON.stringify({ error: message }, null, 2),
                status: 'error',
                errorMessage: message
            });
            return;
        }

        const txValidUntil = data.validUntil || Math.floor(Date.now() / 1000) + 300;
        const txMessages = (data.messages || []).map(msg => {
            const m: Record<string, string> = { address: msg.address, amount: msg.amount };
            if (msg.stateInit) m.stateInit = msg.stateInit;
            if (msg.payload) m.payload = msg.payload;
            return m;
        });

        setIsSending(true);
        try {
            const result = await tonConnectUI.sendTransaction({
                validUntil: txValidUntil,
                messages: txMessages as Array<{
                    address: string;
                    amount: string;
                    stateInit?: string;
                    payload?: string;
                }>
            });
            setLastResult({
                id: crypto.randomUUID(),
                timestamp: Date.now(),
                requestSnapshot: rawJson,
                response: JSON.stringify(result, null, 2),
                status: 'success',
                boc: result.boc,
                validUntil: txValidUntil
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Transaction failed';
            setLastResult({
                id: crypto.randomUUID(),
                timestamp: Date.now(),
                requestSnapshot: rawJson,
                response: JSON.stringify({ error: message }, null, 2),
                status: 'error',
                errorMessage: message
            });
            // eslint-disable-next-line no-console
            console.error('sendTransaction (raw) failed', error);
        } finally {
            setIsSending(false);
        }
    };

    const clearResult = useCallback(() => setLastResult(null), []);

    const loadResultToForm = useCallback(() => {
        if (lastResult) setFromJson(lastResult.requestSnapshot);
    }, [lastResult, setFromJson]);

    const walletChainLabel =
        wallet?.account?.chain === CHAIN.TESTNET ? 'testnet' : wallet ? 'mainnet' : '';

    return {
        validUntil,
        setValidUntil,
        setValidUntilFromNow,
        network,
        setNetwork,
        from,
        setFrom,
        messages,
        getDisplayAmount,
        setMessageAmount,
        getAmountUnit,
        setAmountUnit,
        requestJson,
        loadPreset,
        reset,
        addMessage,
        removeMessage,
        updateMessage,
        send,
        sendRaw,
        setFromJson,
        isConnected: !!wallet,
        isSending,
        lastResult,
        clearResult,
        loadResultToForm,
        isConnectionRestored,
        walletNetwork,
        walletChainLabel
    };
}
