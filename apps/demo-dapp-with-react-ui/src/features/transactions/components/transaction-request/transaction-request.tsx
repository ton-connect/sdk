import { useEffect, useMemo, useRef, useState } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { RotateCcw, Wallet } from 'lucide-react';

import { Button } from '@/core/components/ui/button';
import { EmptyState } from '@/core/components/empty-state';

import { useTransaction } from '../../hooks/use-transaction';
import { PRESETS, type PresetKey } from '../../lib/transaction-presets';

import {
    type EditorMode,
    ModeTabs,
    MessagesList,
    NetworkFromRow,
    type PresetOption,
    RawJsonEditor,
    ResultBlock,
    ValidUntilField
} from './components';
import { useValidUntilTimer } from './hooks';
import { isValidJson } from './utils';

export function TransactionRequest() {
    const [tonConnectUI] = useTonConnectUI();

    const {
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
        isConnected,
        isSending,
        lastResult,
        clearResult,
        loadResultToForm,
        isConnectionRestored,
        walletNetwork
    } = useTransaction();

    const presetOptions = useMemo<readonly PresetOption[]>(
        () =>
            Object.entries(PRESETS).map(([id, preset]) => ({
                id: id as PresetKey,
                name: preset.name,
                description: preset.description
            })),
        []
    );

    const [selectedPreset, setSelectedPreset] = useState<PresetKey | ''>('');
    const [mode, setMode] = useState<EditorMode>('form');
    const [editedJson, setEditedJson] = useState(requestJson);
    const [syntaxError, setSyntaxError] = useState(false);

    const timer = useValidUntilTimer(validUntil);

    // Keep the Raw editor in sync with the form while we're in Form mode.
    useEffect(() => {
        if (mode === 'form') {
            setEditedJson(requestJson);
            setSyntaxError(false);
        }
    }, [requestJson, mode]);

    // Auto-scroll the result block into view when a new result arrives.
    const resultRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (lastResult && resultRef.current) {
            const rect = resultRef.current.getBoundingClientRect();
            if (rect.top < 0 || rect.bottom > window.innerHeight) {
                resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }, [lastResult?.id]);

    const handleModeChange = (next: EditorMode) => {
        if (next === mode) return;
        if (mode === 'raw' && next === 'form') {
            if (!isValidJson(editedJson)) {
                if (!confirm('Invalid JSON syntax. Discard changes and switch to Form?')) return;
                setEditedJson(requestJson);
                setSyntaxError(false);
                setMode('form');
                return;
            }
            setFromJson(editedJson);
        }
        if (mode === 'form' && next === 'raw') {
            setEditedJson(requestJson);
            setSyntaxError(false);
        }
        setMode(next);
    };

    const handlePresetSelect = (key: PresetKey) => {
        setSelectedPreset(key);
        loadPreset(key);
    };

    const handleReset = () => {
        reset();
        setSelectedPreset('');
        setEditedJson('');
        setSyntaxError(false);
    };

    const handleSend = () => {
        if (mode === 'form') {
            send();
            return;
        }
        if (!isValidJson(editedJson)) {
            setSyntaxError(true);
            return;
        }
        sendRaw(editedJson);
    };

    if (!isConnected) {
        return (
            <EmptyState
                icon={Wallet}
                title="Connect a wallet"
                description="A connected wallet is required to build and send a transaction request."
                action={<Button onClick={() => tonConnectUI.openModal()}>Connect wallet</Button>}
            />
        );
    }

    return (
        <>
            <ModeTabs
                mode={mode}
                onModeChange={handleModeChange}
                presetOptions={presetOptions}
                selectedPreset={selectedPreset}
                onPresetSelect={handlePresetSelect}
            />

            {mode === 'form' ? (
                <>
                    <ValidUntilField
                        validUntil={validUntil}
                        onChange={setValidUntil}
                        onSetFromNow={setValidUntilFromNow}
                        timer={timer}
                    />
                    <NetworkFromRow
                        network={network}
                        onNetworkChange={setNetwork}
                        from={from}
                        onFromChange={setFrom}
                        walletNetwork={walletNetwork}
                        isConnectionRestored={isConnectionRestored}
                    />
                    <MessagesList
                        messages={messages}
                        onAdd={addMessage}
                        onRemove={removeMessage}
                        onUpdate={updateMessage}
                        getDisplayAmount={getDisplayAmount}
                        setMessageAmount={setMessageAmount}
                        getAmountUnit={getAmountUnit}
                        setAmountUnit={setAmountUnit}
                    />
                </>
            ) : (
                <RawJsonEditor
                    value={editedJson}
                    onChange={value => {
                        setEditedJson(value);
                        if (syntaxError) setSyntaxError(false);
                    }}
                    syntaxError={syntaxError}
                />
            )}

            <div className="flex flex-wrap gap-2">
                <Button onClick={handleSend} loading={isSending} disabled={!isConnected}>
                    Send Transaction
                </Button>
                <Button variant="ghost" onClick={handleReset}>
                    <RotateCcw className="size-3" />
                    Reset
                </Button>
            </div>

            {lastResult && (
                <ResultBlock
                    ref={resultRef}
                    result={lastResult}
                    onLoadToForm={loadResultToForm}
                    onDismiss={clearResult}
                />
            )}
        </>
    );
}
