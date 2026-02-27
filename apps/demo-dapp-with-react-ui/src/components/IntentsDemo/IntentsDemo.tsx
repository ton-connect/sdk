import { useEffect, useState } from 'react';
import { CHAIN, useTonConnectUI, useTonWallet, TonConnectButton } from '@tonconnect/ui-react';
import type {
    SendTransactionIntentRequest,
    SignDataIntentRequest,
    SignMessageIntentRequest,
    SendActionIntentRequest
} from '@tonconnect/sdk';
import ReactJson from 'react-json-view';
import './style.scss';

export function IntentsDemo() {
    const wallet = useTonWallet();
    const [tonConnectUi] = useTonConnectUI();

    const [lastIntentPayload, setLastIntentPayload] = useState<object | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [lastIntentResult, setLastIntentResult] = useState<any | null>(null);

    const commonOptions = {
        modals: 'all' as const,
        notifications: ['before'] as ('before' | 'success' | 'error')[]
    };

    useEffect(() => {
        const unsubscribe = tonConnectUi.connector.onIntentResponse(response => {
            setLastIntentResult(response);
        });

        return unsubscribe;
    }, [tonConnectUi]);

    const handleSendTransactionIntent = async () => {
        const intent: SendTransactionIntentRequest = {
            validUntil: Math.floor(Date.now() / 1000) + 600,
            network: wallet?.account.chain,
            items: [
                {
                    type: 'ton',
                    // Use connected wallet as recipient if available, otherwise demo address
                    address:
                        wallet?.account.address ??
                        'EQCKWpx7cNMpvmcN5ObM5lLUZHZRFKqYA4xmw9jOry0ZsF9M',
                    amount: '1000000'
                }
            ]
        };

        setLastIntentPayload(intent);

        try {
            await tonConnectUi.sendTransactionIntent(intent, commonOptions);
        } catch (e) {
            // result tracking is not implemented yet; errors are logged for debugging

            console.error('sendTransactionIntent failed:', e);
        }
    };

    const handleSignDataIntent = async () => {
        const intent: SignDataIntentRequest = {
            network: wallet?.account.chain,
            payload: {
                type: 'text',
                text: 'Sign this sample text via intent.'
            }
        };

        setLastIntentPayload(intent);

        try {
            const response = await tonConnectUi.signDataIntent(intent, commonOptions);
            setLastIntentResult(response);
        } catch (e) {
            console.error('signDataIntent failed:', e);
        }
    };

    const handleSignMessageIntent = async () => {
        const intent: SignMessageIntentRequest = {
            validUntil: Math.floor(Date.now() / 1000) + 600,
            network: wallet?.account.chain ?? CHAIN.TESTNET,
            items: [
                {
                    type: 'ton',
                    address:
                        wallet?.account.address ??
                        'EQCKWpx7cNMpvmcN5ObM5lLUZHZRFKqYA4xmw9jOry0ZsF9M',
                    amount: '0'
                }
            ]
        };

        setLastIntentPayload(intent);

        try {
            await tonConnectUi.signMessageIntent(intent, commonOptions);
        } catch (e) {
            console.error('signMessageIntent failed:', e);
        }
    };

    const handleSendActionIntent = async () => {
        const origin =
            typeof window !== 'undefined' ? window.location.origin : 'https://example.com';

        const accountAddress =
            wallet?.account.address ?? 'EQCKWpx7cNMpvmcN5ObM5lLUZHZRFKqYA4xmw9jOry0ZsF9M';

        const intent: SendActionIntentRequest = {
            actionUrl: `${origin}/intent-action-demo?address=${encodeURIComponent(accountAddress)}`
        };

        setLastIntentPayload(intent);

        try {
            await tonConnectUi.sendActionIntent(intent, commonOptions);
        } catch (e) {
            console.error('sendActionIntent failed:', e);
        }
    };

    return (
        <div className="intents-demo">
            <h3>TonConnect intents</h3>
            <p className="intents-demo__subtitle">
                Prepare actions without active session and hand them to the wallet via QR / deep
                link.
            </p>

            <div className="intents-demo__card intents-demo__connect-scenario">
                <div className="intents-demo__section-title">Connect scenario</div>
                <p className="intents-demo__connect-hint">
                    Connect your wallet first, then use the intent actions below. If not connected,
                    the connect modal will open when you trigger an intent.
                </p>
                <div className="intents-demo__connect-row">
                    <span
                        className={
                            wallet
                                ? 'intents-demo__status intents-demo__status--connected'
                                : 'intents-demo__status intents-demo__status--disconnected'
                        }
                    >
                        {wallet
                            ? `Connected: ${wallet.account.address.slice(0, 8)}…`
                            : 'Not connected'}
                    </span>
                    <TonConnectButton />
                </div>
            </div>

            <div className="intents-demo__layout">
                <div className="intents-demo__column">
                    <div className="intents-demo__card">
                        <div className="intents-demo__section-title">Run intent examples</div>
                        {wallet ? (
                            <div className="intents-demo__wallet-label">
                                Using account {wallet.account.address.slice(0, 6)}…
                            </div>
                        ) : (
                            <div className="intents-demo__wallet-label intents-demo__wallet-label--disconnected">
                                Wallet is not connected yet. Any button will open connect modal.
                            </div>
                        )}

                        <div className="intents-demo__buttons">
                            <button onClick={handleSendTransactionIntent}>
                                Send transaction intent
                            </button>
                            <button onClick={handleSignDataIntent}>Sign data intent</button>
                            <button onClick={handleSignMessageIntent}>Sign message intent</button>
                            <button onClick={handleSendActionIntent}>Send action intent</button>
                        </div>
                    </div>
                </div>

                <div className="intents-demo__column intents-demo__column--right">
                    <div className="intents-demo__card">
                        <div className="intents-demo__section-title">Last intent payload</div>
                        {lastIntentPayload ? (
                            <div className="intents-demo__json">
                                <ReactJson src={lastIntentPayload} name={false} theme="ocean" />
                            </div>
                        ) : (
                            <div className="intents-demo__placeholder">
                                Trigger any intent on the left to see the prepared SDK payload here.
                            </div>
                        )}
                    </div>
                    <div className="intents-demo__card" style={{ marginTop: 12 }}>
                        <div className="intents-demo__section-title">Last intent result</div>
                        {lastIntentResult ? (
                            <div className="intents-demo__json">
                                <ReactJson src={lastIntentResult} name={false} theme="ocean" />
                            </div>
                        ) : (
                            <div className="intents-demo__placeholder">
                                After you confirm an intent in the wallet, the raw response received
                                over the bridge will appear here.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
