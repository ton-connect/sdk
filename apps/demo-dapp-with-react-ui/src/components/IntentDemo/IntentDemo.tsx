import { useState, useEffect } from 'react';
import ReactJson from 'react-json-view';
import './style.scss';
import { useTonConnectUI } from '@tonconnect/ui-react';
import {
    MakeSendTransactionIntentRequest,
    IntentItem,
    MakeSignDataIntentRequest,
    MakeSignMessageIntentRequest,
    SendJettonItem
} from '@tonconnect/sdk';
import { TonProofDemoApi } from '../../TonProofDemoApi';

const defaultIntentItem: IntentItem = {
    t: 'ton',
    a: 'EQCKWpx7cNMpvmcN5ObM5lLUZHZRFKqYA4xmw9jOry0ZsF9M',
    am: '5000000'
};

const defaultUsdtItem: SendJettonItem = {
    t: 'jetton',
    ma: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs', // USDT master address
    ja: '100000', // 0.1 USDT (6 decimals: 100000 = 0.1 USDT)
    d: 'UQCi2rD7uYZwvg7Oy3LCD1Q6Uolz5Ns5oEFULLhYKssb9amR' // destination address
};

export function IntentDemo() {
    const [loading, setLoading] = useState(false);
    const [intentResult, setIntentResult] = useState<string | null>(null);
    const [intentResponse, setIntentResponse] = useState<Record<string, unknown> | null>(null);
    const [intentRequest, setIntentRequest] = useState<MakeSendTransactionIntentRequest>({
        id: `intent-${Date.now()}`,
        i: [defaultIntentItem],
        vu: Math.floor(Date.now() / 1000) + 600
    });

    const [tonConnectUI] = useTonConnectUI();

    useEffect(() => {
        const generateProof = async () => {
            const payload = await TonProofDemoApi.generatePayload();
            if (payload?.tonProof) {
                // Set intent connect request parameters: include connect with ton_proof
                tonConnectUI.setIntentConnectRequestParameters?.({
                    includeConnect: true,
                    includeTonProof: true,
                    tonProofPayload: payload.tonProof
                });
            } else {
                // If no payload, still include connect but without ton_proof
                tonConnectUI.setIntentConnectRequestParameters?.({
                    includeConnect: true,
                    includeTonProof: false
                });
            }
        };
        generateProof();
    }, [tonConnectUI]);

    // Listen for intent responses
    useEffect(() => {
        const unsubscribe = tonConnectUI.onIntentResponse?.(
            (response: { result?: unknown; error?: unknown; id: string; traceId?: string }) => {
                setIntentResponse(response);
            }
        );

        return () => {
            unsubscribe?.();
        };
    }, [tonConnectUI]);

    const handleMakeSendTransactionIntent = async () => {
        setIntentResult(null);
        setIntentResponse(null);
        setLoading(true);
        try {
            const universalLink = await tonConnectUI.makeSendTransactionIntent(intentRequest);
            setIntentResult(universalLink);
        } catch (error) {
            console.error('Error creating intent:', error);
            setIntentResult(error instanceof Error ? error.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const handleMakeSignDataIntent = async () => {
        setIntentResult(null);
        setIntentResponse(null);
        setLoading(true);
        try {
            const signDataIntent: MakeSignDataIntentRequest = {
                id: `sign-intent-${Date.now()}`,
                mu: 'https://sdk-demo-dapp-react-git-feat-intent-transactions-topteam.vercel.app/tonconnect-manifest.json',
                p: {
                    type: 'text',
                    text: 'Sign this message to confirm your identity'
                }
            };
            const universalLink = await tonConnectUI.makeSignDataIntent(signDataIntent);
            setIntentResult(universalLink);
        } catch (error) {
            console.error('Error creating sign data intent:', error);
            setIntentResult(error instanceof Error ? error.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const handleMakeSignMessageIntent = async () => {
        setIntentResult(null);
        setIntentResponse(null);
        setLoading(true);
        try {
            const signMessageIntent: MakeSignMessageIntentRequest = {
                id: `sign-msg-intent-${Date.now()}`,
                i: intentRequest.i,
                vu: intentRequest.vu,
                n: intentRequest.n
            };
            const universalLink = await tonConnectUI.makeSignMessageIntent(signMessageIntent);
            setIntentResult(universalLink);
        } catch (error) {
            console.error('Error creating sign message intent:', error);
            setIntentResult(error instanceof Error ? error.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const handleMakeUsdtTransferIntent = async () => {
        setIntentResult(null);
        setIntentResponse(null);
        setLoading(true);
        try {
            // Create USDT transfer intent with USDT parameters
            const usdtIntent: MakeSendTransactionIntentRequest = {
                id: `usdt-intent-${Date.now()}`,
                i: [defaultUsdtItem],
                vu: intentRequest.vu || Math.floor(Date.now() / 1000) + 600,
                n: intentRequest.n,
                c: intentRequest.c
            };
            const universalLink = await tonConnectUI.makeSendTransactionIntent(usdtIntent);
            setIntentResult(universalLink);
        } catch (error) {
            console.error('Error creating USDT transfer intent:', error);
            setIntentResult(error instanceof Error ? error.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const handleMakeSignMessageUsdtIntent = async () => {
        setIntentResult(null);
        setIntentResponse(null);
        setLoading(true);
        try {
            // Create sign message USDT intent with USDT parameters
            const signMessageUsdtIntent: MakeSignMessageIntentRequest = {
                id: `sign-msg-usdt-intent-${Date.now()}`,
                i: [defaultUsdtItem],
                vu: intentRequest.vu || Math.floor(Date.now() / 1000) + 600,
                n: intentRequest.n,
                c: intentRequest.c
            };
            const universalLink = await tonConnectUI.makeSignMessageIntent(signMessageUsdtIntent);
            setIntentResult(universalLink);
        } catch (error) {
            console.error('Error creating sign message USDT intent:', error);
            setIntentResult(error instanceof Error ? error.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="intent-demo">
            <h3>Transaction Intent (works without connected wallet)</h3>
            <div className="intent-demo__info">
                Intents allow users to complete transactions without being connected to the wallet.
                The QR code modal will open automatically.
            </div>

            <div className="intent-demo__request">
                <div className="find-transaction-demo__json-label">Intent Request</div>
                <ReactJson
                    theme="ocean"
                    src={intentRequest}
                    onEdit={(value: { updated_src: unknown }) => {
                        setIntentRequest(value.updated_src as MakeSendTransactionIntentRequest);
                    }}
                    onAdd={(value: { updated_src: unknown }) => {
                        setIntentRequest(value.updated_src as MakeSendTransactionIntentRequest);
                    }}
                    onDelete={(value: { updated_src: unknown }) => {
                        setIntentRequest(value.updated_src as MakeSendTransactionIntentRequest);
                    }}
                />
            </div>

            <div className="intent-demo__buttons">
                <button onClick={handleMakeSendTransactionIntent} disabled={loading}>
                    {loading ? 'Creating intent...' : 'Create Transaction Intent'}
                </button>
                <button onClick={handleMakeSignDataIntent} disabled={loading}>
                    {loading ? 'Creating intent...' : 'Create Sign Data Intent'}
                </button>
                <button onClick={handleMakeSignMessageIntent} disabled={loading}>
                    {loading ? 'Creating intent...' : 'Create Sign Message Intent'}
                </button>
                <button onClick={handleMakeUsdtTransferIntent} disabled={loading}>
                    {loading ? 'Creating intent...' : 'Create USDT Transfer Intent'}
                </button>
                <button onClick={handleMakeSignMessageUsdtIntent} disabled={loading}>
                    {loading ? 'Creating intent...' : 'Create Sign Message USDT Intent'}
                </button>
            </div>

            {intentResult && (
                <>
                    <div className="find-transaction-demo__json-label">Universal Link</div>
                    <div className="find-transaction-demo__json-view">
                        <div style={{ wordBreak: 'break-all', color: '#66aaee' }}>
                            {intentResult}
                        </div>
                    </div>
                </>
            )}

            {intentResponse && (
                <>
                    <div className="find-transaction-demo__json-label">Intent Result</div>
                    <div className="find-transaction-demo__json-view">
                        <ReactJson theme="ocean" src={intentResponse} collapsed={false} />
                    </div>
                </>
            )}
        </div>
    );
}
