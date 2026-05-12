import { useState } from 'react';

type Pending = {
    label: string;
    onConfirm: () => void;
    onCancel: () => void;
};

/**
 * Renders a modal that asks the user to tap "Open wallet". `openModal` returns
 * a promise that resolves `true` on confirm and `false` on cancel — call it
 * from inside an embedded-request `onConnected` callback to gate the bridge
 * dispatch behind a fresh user click. The click keeps transient user
 * activation alive so the SDK's `redirectToWallet` (passed via
 * `send({ onRequestSent })`) can launch the wallet app on Android.
 */
export function useOpenWalletPrompt() {
    const [pending, setPending] = useState<Pending | null>(null);

    const openModal = (options: { label: string }): Promise<boolean> =>
        new Promise<boolean>(resolve => {
            setPending({
                label: options.label,
                onConfirm: () => {
                    setPending(null);
                    resolve(true);
                },
                onCancel: () => {
                    setPending(null);
                    resolve(false);
                }
            });
        });

    const modal = pending ? <OpenWalletPromptModal pending={pending} /> : null;

    return { openModal, modal };
}

function OpenWalletPromptModal({ pending }: { pending: Pending }) {
    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(10, 18, 30, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999
            }}
        >
            <div
                style={{
                    background: 'rgba(24, 32, 48, 0.98)',
                    borderRadius: 14,
                    padding: '24px 28px',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                    minWidth: 280,
                    color: '#b8d4f1'
                }}
            >
                <div style={{ fontSize: 15, lineHeight: 1.4 }}>
                    Tap the button to open your wallet. The click is required so the browser keeps
                    user activation alive for the redirect.
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button
                        onClick={pending.onCancel}
                        style={{
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: 10,
                            cursor: 'pointer',
                            background: 'rgba(255,255,255,0.08)',
                            color: '#b8d4f1',
                            fontSize: 15
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={pending.onConfirm}
                        style={{
                            border: 'none',
                            padding: '8px 18px',
                            borderRadius: 10,
                            cursor: 'pointer',
                            background: '#43a047',
                            color: 'white',
                            fontSize: 15
                        }}
                    >
                        {pending.label}
                    </button>
                </div>
            </div>
        </div>
    );
}
