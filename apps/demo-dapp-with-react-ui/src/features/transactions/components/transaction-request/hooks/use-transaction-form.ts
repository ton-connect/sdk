import { useCallback, useMemo, useState } from 'react';
import { useIsConnectionRestored, useTonWallet } from '@tonconnect/ui-react';
import { fromNano, toNano } from '@ton/core';

import {
    newMessageId,
    PRESETS,
    type AmountUnit,
    type PresetKey,
    type TransactionMessage
} from '../../../lib/transaction-presets';
import { buildOutgoingMessages } from '../utils';

const DEFAULT_ADDRESS = 'EQCKWpx7cNMpvmcN5ObM5lLUZHZRFKqYA4xmw9jOry0ZsF9M';

const initialMessage = (): TransactionMessage => ({
    id: newMessageId(),
    address: DEFAULT_ADDRESS,
    amount: '5000000',
    stateInit: '',
    payload: ''
});

/**
 * Owns the in-memory transaction-request form state and the derived
 * `requestJson` preview. Mutators are id-based (no array-index drift on
 * remove/reorder). The hook also surfaces the wallet-network proxy and the
 * connection-restored flag used by the form's field components.
 */
export function useTransactionForm() {
    const wallet = useTonWallet();
    const isConnectionRestored = useIsConnectionRestored();

    const [validUntil, setValidUntil] = useState(() => Math.floor(Date.now() / 1000) + 86400);
    const [network, setNetwork] = useState('');
    const [from, setFrom] = useState('');
    const [messages, setMessages] = useState<TransactionMessage[]>(() => [initialMessage()]);
    const [amountUnits, setAmountUnits] = useState<Record<string, AmountUnit>>({});

    const walletNetwork = useMemo(
        () => (isConnectionRestored && wallet?.account?.chain ? String(wallet.account.chain) : ''),
        [isConnectionRestored, wallet?.account?.chain]
    );

    const requestJson = useMemo(() => {
        const effectiveNetwork = network || walletNetwork;
        const tx: Record<string, unknown> = {
            validUntil,
            messages: buildOutgoingMessages(messages)
        };
        if (effectiveNetwork) tx.network = effectiveNetwork;
        if (from) tx.from = from;
        return JSON.stringify(tx, null, 2);
    }, [validUntil, network, from, messages, walletNetwork]);

    const setValidUntilFromNow = useCallback((seconds: number) => {
        setValidUntil(Math.floor(Date.now() / 1000) + seconds);
    }, []);

    const reset = useCallback(() => {
        setValidUntil(Math.floor(Date.now() / 1000) + 86400);
        setNetwork('');
        setFrom('');
        setMessages([initialMessage()]);
        setAmountUnits({});
    }, []);

    const getDisplayAmount = useCallback(
        (id: string): string => {
            const unit = amountUnits[id] || 'TON';
            const nanoAmount = messages.find(m => m.id === id)?.amount || '0';
            if (unit === 'TON') return fromNano(nanoAmount);
            return nanoAmount;
        },
        [messages, amountUnits]
    );

    const setMessageAmount = useCallback((id: string, displayValue: string, unit: AmountUnit) => {
        try {
            const nanoValue =
                unit === 'TON' ? toNano(displayValue || '0').toString() : displayValue;
            setMessages(prev => prev.map(m => (m.id === id ? { ...m, amount: nanoValue } : m)));
        } catch {
            // invalid number — ignore
        }
    }, []);

    const getAmountUnit = useCallback(
        (id: string): AmountUnit => amountUnits[id] || 'TON',
        [amountUnits]
    );

    const setAmountUnit = useCallback((id: string, unit: AmountUnit) => {
        setAmountUnits(prev => ({ ...prev, [id]: unit }));
    }, []);

    const loadPreset = useCallback((key: PresetKey) => {
        const preset = PRESETS[key];
        setValidUntil(Math.floor(Date.now() / 1000) + preset.validUntil);
        setNetwork('');
        setFrom(preset.from);
        setMessages(
            preset.messages.map(msg => ({
                id: newMessageId(),
                address: msg.address,
                amount: msg.amount,
                stateInit: '',
                payload: 'payload' in msg ? (msg as { payload: string }).payload : ''
            }))
        );
        setAmountUnits({});
    }, []);

    const addMessage = useCallback(() => {
        setMessages(prev => [
            ...prev,
            {
                id: newMessageId(),
                address: '',
                amount: toNano('0.001').toString(),
                stateInit: '',
                payload: ''
            }
        ]);
    }, []);

    const removeMessage = useCallback((id: string) => {
        setMessages(prev => (prev.length > 1 ? prev.filter(m => m.id !== id) : prev));
        setAmountUnits(prev => {
            if (!(id in prev)) return prev;
            const next = { ...prev };
            delete next[id];
            return next;
        });
    }, []);

    const updateMessage = useCallback(
        (id: string, field: keyof TransactionMessage, value: string) => {
            setMessages(prev => prev.map(m => (m.id === id ? { ...m, [field]: value } : m)));
        },
        []
    );

    const setFromJson = useCallback((json: string) => {
        try {
            const data = JSON.parse(json);
            if (data.validUntil) setValidUntil(data.validUntil);
            if (data.network !== undefined) setNetwork(data.network);
            if (data.from !== undefined) setFrom(data.from);
            if (Array.isArray(data.messages)) {
                const newMessages: TransactionMessage[] = data.messages.map(
                    (msg: Record<string, string>) => ({
                        id: newMessageId(),
                        address: msg.address || '',
                        amount: msg.amount || '0',
                        stateInit: msg.stateInit || '',
                        payload: msg.payload || ''
                    })
                );
                setMessages(newMessages);
                // JSON amounts are nanotons — default unit display to nano per row.
                const newUnits: Record<string, AmountUnit> = {};
                newMessages.forEach(m => {
                    newUnits[m.id] = 'nano';
                });
                setAmountUnits(newUnits);
            }
        } catch {
            // invalid json — ignore
        }
    }, []);

    return {
        // primary form state
        validUntil,
        setValidUntil,
        setValidUntilFromNow,
        network,
        setNetwork,
        from,
        setFrom,
        messages,
        // amount helpers (per-message id)
        getDisplayAmount,
        setMessageAmount,
        getAmountUnit,
        setAmountUnit,
        // collection mutators (per-message id)
        addMessage,
        removeMessage,
        updateMessage,
        // bulk mutators
        loadPreset,
        reset,
        setFromJson,
        // derived
        requestJson,
        // wallet proxies (consumed by NetworkFromRow)
        walletNetwork,
        isConnectionRestored
    };
}
