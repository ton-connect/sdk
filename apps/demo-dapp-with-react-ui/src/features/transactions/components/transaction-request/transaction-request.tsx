import { useEffect, useMemo, useRef, useState } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { Wallet } from 'lucide-react';

import { Button } from '@/core/components/ui/button';
import { Modal } from '@/core/components/ui/modal';
import { EmptyState } from '@/core/components/empty-state';

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
import { useSendTransaction, useTransactionForm, useValidUntilTimer } from './hooks';
import { buildOutgoingMessages, isValidJson } from './utils';

export function TransactionRequest() {
    const [tonConnectUI] = useTonConnectUI();
    const wallet = useTonWallet();
    const isConnected = !!wallet;

    const form = useTransactionForm();
    const sending = useSendTransaction();
    const timer = useValidUntilTimer(form.validUntil);

    const presetOptions = useMemo<readonly PresetOption[]>(
        () =>
            Object.entries(PRESETS).map(([id, preset]) => ({
                id: id as PresetKey,
                name: preset.name,
                description: preset.description
            })),
        []
    );

    const [mode, setMode] = useState<EditorMode>('form');
    const [editedJson, setEditedJson] = useState(form.requestJson);
    const [syntaxError, setSyntaxError] = useState(false);
    const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);

    // Derive the selected preset from the current form. Once the user edits any
    // structural field (messages, from) the match breaks and the selector goes
    // back to "Load a preset…" automatically — no drift state to manage.
    const selectedPreset = useMemo<PresetKey | ''>(() => {
        const entries = Object.entries(PRESETS) as [PresetKey, (typeof PRESETS)[PresetKey]][];
        const match = entries.find(
            ([, preset]) =>
                preset.from === form.from &&
                preset.messages.length === form.messages.length &&
                preset.messages.every((p, i) => {
                    const m = form.messages[i];
                    const presetPayload = 'payload' in p ? p.payload : '';
                    return (
                        p.address === m.address &&
                        p.amount === m.amount &&
                        !m.stateInit &&
                        (m.payload ?? '') === (presetPayload ?? '')
                    );
                })
        );
        return match ? match[0] : '';
    }, [form.from, form.messages]);

    // Keep the Raw editor in sync with the form while we're in Form mode.
    useEffect(() => {
        if (mode === 'form') {
            setEditedJson(form.requestJson);
            setSyntaxError(false);
        }
    }, [form.requestJson, mode]);

    // Auto-scroll the result block into view when a new result arrives.
    const resultRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (sending.lastResult && resultRef.current) {
            const rect = resultRef.current.getBoundingClientRect();
            if (rect.top < 0 || rect.bottom > window.innerHeight) {
                resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }, [sending.lastResult?.id]);

    const handleModeChange = (next: EditorMode) => {
        if (next === mode) return;
        if (mode === 'json' && next === 'form') {
            if (!isValidJson(editedJson)) {
                setDiscardConfirmOpen(true);
                return;
            }
            form.setFromJson(editedJson);
        }
        if (mode === 'form' && next === 'json') {
            setEditedJson(form.requestJson);
            setSyntaxError(false);
        }
        setMode(next);
    };

    const confirmDiscardAndSwitch = () => {
        setEditedJson(form.requestJson);
        setSyntaxError(false);
        setMode('form');
        setDiscardConfirmOpen(false);
    };

    const handlePresetSelect = (key: PresetKey) => {
        form.loadPreset(key);
    };

    const handleReset = () => {
        form.reset();
        sending.clearResult();
        setSyntaxError(false);
        // Snap back to Form view; the sync-effect picks up the fresh requestJson
        // and pushes it into the Raw editor as well, so switching back is clean.
        setMode('form');
    };

    const handleSend = () => {
        if (mode === 'form') {
            sending.send({
                snapshot: form.requestJson,
                validUntil: form.validUntil,
                messages: buildOutgoingMessages(form.messages)
            });
            return;
        }
        if (!isValidJson(editedJson)) {
            setSyntaxError(true);
            return;
        }
        sending.sendRaw(editedJson);
    };

    const handleLoadResultToForm = () => {
        if (sending.lastResult) form.setFromJson(sending.lastResult.requestSnapshot);
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
                onReset={handleReset}
            />

            {mode === 'form' ? (
                <>
                    <ValidUntilField
                        validUntil={form.validUntil}
                        onChange={form.setValidUntil}
                        onSetFromNow={form.setValidUntilFromNow}
                        timer={timer}
                    />
                    <NetworkFromRow
                        network={form.network}
                        onNetworkChange={form.setNetwork}
                        from={form.from}
                        onFromChange={form.setFrom}
                        walletNetwork={form.walletNetwork}
                        isConnectionRestored={form.isConnectionRestored}
                    />
                    <MessagesList
                        messages={form.messages}
                        onAdd={form.addMessage}
                        onRemove={form.removeMessage}
                        onUpdate={form.updateMessage}
                        getDisplayAmount={form.getDisplayAmount}
                        setMessageAmount={form.setMessageAmount}
                        getAmountUnit={form.getAmountUnit}
                        setAmountUnit={form.setAmountUnit}
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

            <Button
                size="l"
                fullWidth
                onClick={handleSend}
                loading={sending.isSending}
                disabled={!isConnected}
            >
                Send Transaction
            </Button>

            {sending.lastResult && (
                <ResultBlock
                    ref={resultRef}
                    result={sending.lastResult}
                    onLoadToForm={handleLoadResultToForm}
                    onDismiss={sending.clearResult}
                />
            )}

            <Modal
                open={discardConfirmOpen}
                onOpenChange={setDiscardConfirmOpen}
                title="Discard raw JSON?"
            >
                <p className="mb-5 text-sm leading-relaxed text-secondary-foreground">
                    The raw JSON has a syntax error and can&apos;t be parsed back into the form.
                    Switching to Form will discard your raw changes.
                </p>
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setDiscardConfirmOpen(false)}>
                        Keep editing
                    </Button>
                    <Button onClick={confirmDiscardAndSwitch}>Discard and switch</Button>
                </div>
            </Modal>
        </>
    );
}
