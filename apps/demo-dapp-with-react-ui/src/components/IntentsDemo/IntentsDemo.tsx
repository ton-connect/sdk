import { useState } from 'react';
import { CHAIN, useTonConnectUI, useTonWallet, TonConnectButton } from '@tonconnect/ui-react';
import type {
    SendTransactionDraftRequest,
    SignDataPayload,
    SignMessageDraftRequest,
    SendActionDraftRequest
} from '@tonconnect/sdk';
import ReactJson from 'react-json-view';
import './style.scss';

const ACTION_DEMO_FILES = {
    signData: '/intent-actions/demo-sign-data.json',
    sendTransaction: '/intent-actions/demo-send-transaction.json',
    signMessage: '/intent-actions/demo-sign-message.json'
} as const;

const DEMO_ADDRESSES = {
    jettonMaster: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
    fallbackAccount: 'EQCKWpx7cNMpvmcN5ObM5lLUZHZRFKqYA4xmw9jOry0ZsF9M'
} as const;

export function IntentsDemo() {
    const wallet = useTonWallet();
    const [tonConnectUi] = useTonConnectUI();
    const [lastIntentPayload, setLastIntentPayload] = useState<object | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [lastIntentResult, setLastIntentResult] = useState<any | null>(null);
    const [useObjectStorageMode, setUseObjectStorageMode] = useState(false);
    const [noConnect, setNoConnect] = useState(false);
    const [selectedActionType, setSelectedActionType] =
        useState<keyof typeof ACTION_DEMO_FILES>('signData');

    const commonOptions = {
        notifications: ['before', 'success', 'error'] as ('before' | 'success' | 'error')[],
        noConnect
    };

    const handleSendTransactionIntent = async () => {
        const recipientAddress = wallet?.account.address ?? DEMO_ADDRESSES.fallbackAccount;

        const baseItem = {
            type: 'ton' as const,
            address: recipientAddress,
            amount: '1000000'
        };

        const items = useObjectStorageMode
            ? Array.from({ length: 30 }, () => ({ ...baseItem }))
            : [baseItem];

        const intent: SendTransactionDraftRequest = {
            validUntil: Math.floor(Date.now() / 1000) + 600,
            network: wallet?.account.chain,
            items
        };

        setLastIntentPayload(intent);

        try {
            const response = await tonConnectUi.sendTransactionDraft(intent, commonOptions);
            setLastIntentResult(response);
        } catch (e) {
            // result tracking is not implemented yet; errors are logged for debugging

            console.error('sendTransactionDraft failed:', e);
        }
    };

    const handleSendJettonIntent = async () => {
        const accountAddress = wallet?.account.address ?? DEMO_ADDRESSES.fallbackAccount;

        const jettonItemBase = {
            type: 'jetton' as const,
            jettonMasterAddress: DEMO_ADDRESSES.jettonMaster,
            jettonAmount: '1000000',
            attachedTon: '2000000',
            destination: accountAddress,
            responseDestination: accountAddress,
            forwardTonAmount: '1000000'
        };

        const items = useObjectStorageMode
            ? Array.from({ length: 20 }, (_, index) => ({
                  ...jettonItemBase,
                  queryId: index + 1
              }))
            : [jettonItemBase];

        const intent: SendTransactionDraftRequest = {
            validUntil: Math.floor(Date.now() / 1000) + 600,
            network: wallet?.account.chain,
            items
        };

        setLastIntentPayload(intent);

        try {
            const response = await tonConnectUi.sendTransactionDraft(intent, commonOptions);
            setLastIntentResult(response);
        } catch (e) {
            console.error('sendJettonIntent failed:', e);
        }
    };

    const handleSignDataIntent = async () => {
        const payloadText = useObjectStorageMode
            ? 'Sign this sample text via intent. '.repeat(400)
            : 'Sign this sample text via intent.';

        const intent: SignDataPayload = {
            type: 'text',
            text: payloadText,
            network: wallet?.account.chain
        };

        setLastIntentPayload(intent);

        try {
            const response = await tonConnectUi.signData(intent, {
                ...commonOptions,
                useIntent: true
            });
            setLastIntentResult(response);
        } catch (e) {
            console.error('signDataDraft failed:', e);
        }
    };

    const handleSignMessageIntent = async () => {
        const recipientAddress = wallet?.account.address ?? DEMO_ADDRESSES.fallbackAccount;

        const baseItem = {
            type: 'ton' as const,
            address: recipientAddress,
            amount: '10'
        };

        const items = useObjectStorageMode
            ? Array.from({ length: 40 }, () => ({ ...baseItem }))
            : [baseItem];

        const intent: SignMessageDraftRequest = {
            validUntil: Math.floor(Date.now() / 1000) + 600,
            network: wallet?.account.chain ?? CHAIN.TESTNET,
            items
        };

        setLastIntentPayload(intent);

        try {
            const response = await tonConnectUi.signMessageDraft(intent, commonOptions);
            setLastIntentResult(response);
        } catch (e) {
            console.error('signMessageDraft failed:', e);
        }
    };

    const handleSignJettonMessageIntent = async () => {
        const accountAddress = wallet?.account.address ?? DEMO_ADDRESSES.fallbackAccount;

        const jettonItemBase = {
            type: 'jetton' as const,
            jettonMasterAddress: DEMO_ADDRESSES.jettonMaster,
            jettonAmount: '500000',
            attachedTon: '1500000',
            destination: accountAddress,
            responseDestination: accountAddress,
            forwardTonAmount: '500000'
        };

        const items = useObjectStorageMode
            ? Array.from({ length: 25 }, (_, index) => ({
                  ...jettonItemBase,
                  queryId: index + 1
              }))
            : [jettonItemBase];

        const intent: SignMessageDraftRequest = {
            validUntil: Math.floor(Date.now() / 1000) + 600,
            network: wallet?.account.chain ?? CHAIN.TESTNET,
            items
        };

        setLastIntentPayload(intent);

        try {
            const response = await tonConnectUi.signMessageDraft(intent, commonOptions);
            setLastIntentResult(response);
        } catch (e) {
            console.error('signJettonMessageDraft failed:', e);
        }
    };

    const handleSendActionIntent = async () => {
        const origin =
            typeof window !== 'undefined' ? window.location.origin : 'https://example.com';

        const intent: SendActionDraftRequest = {
            actionUrl: `${origin}${ACTION_DEMO_FILES[selectedActionType]}`
        };

        setLastIntentPayload(intent);

        try {
            const response = await tonConnectUi.sendActionDraft(intent, commonOptions);
            setLastIntentResult(response);
        } catch (e) {
            console.error('sendActionDraft failed:', e);
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

                        <div className="intents-demo__options">
                            <label className="intents-demo__checkbox">
                                <input
                                    type="checkbox"
                                    checked={useObjectStorageMode}
                                    onChange={e => setUseObjectStorageMode(e.target.checked)}
                                />
                                <span>
                                    Generate large payloads (force object storage for intents)
                                </span>
                            </label>
                            <label className="intents-demo__checkbox">
                                <input
                                    type="checkbox"
                                    checked={noConnect}
                                    onChange={e => setNoConnect(e.target.checked)}
                                />
                                <span>noConnect (generate intent link without connectRequest)</span>
                            </label>
                        </div>

                        <div className="intents-demo__buttons">
                            <button onClick={handleSendTransactionIntent}>
                                Send transaction intent
                            </button>
                            <button onClick={handleSendJettonIntent}>Send jetton intent</button>
                            <button onClick={handleSignDataIntent}>Sign data intent</button>
                            <button onClick={handleSignMessageIntent}>Sign message intent</button>
                            <button onClick={handleSignJettonMessageIntent}>
                                Sign jetton message intent
                            </button>
                        </div>

                        <div className="intents-demo__send-action">
                            <div className="intents-demo__label intents-demo__send-action-title">
                                Send action intent
                            </div>
                            <label className="intents-demo__row">
                                <span className="intents-demo__label">Action type</span>
                                <select
                                    className="intents-demo__select"
                                    value={selectedActionType}
                                    onChange={e =>
                                        setSelectedActionType(
                                            e.target.value as keyof typeof ACTION_DEMO_FILES
                                        )
                                    }
                                >
                                    <option value="signData">signData</option>
                                    <option value="sendTransaction">sendTransaction</option>
                                    <option value="signMessage">signMessage</option>
                                </select>
                            </label>
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
