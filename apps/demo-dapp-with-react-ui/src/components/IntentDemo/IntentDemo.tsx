import { useState, useEffect } from 'react';
import ReactJson from 'react-json-view';
import './style.scss';
import { useTonConnectUI } from '@tonconnect/ui-react';
import {
    MakeSendTransactionIntentRequest,
    IntentItem,
    MakeSignDataIntentRequest
} from '@tonconnect/sdk';
import { TonProofDemoApi } from '../../TonProofDemoApi';

const defaultIntentItem: IntentItem = {
    t: 'ton',
    a: 'EQCKWpx7cNMpvmcN5ObM5lLUZHZRFKqYA4xmw9jOry0ZsF9M',
    am: '5000000'
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
