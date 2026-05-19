/* eslint-disable no-console */
import {
    SignDataPayload,
    SignDataResponse,
    useTonConnectUI,
    useTonWallet
} from '@tonconnect/ui-react';
import { beginCell } from '@ton/ton';
import { useState } from 'react';
import ReactJson from 'react-json-view';
import { TonProofDemoApi } from '@/core/lib/ton-proof-demo-api';

const textPayload = (): SignDataPayload => ({
    type: 'text',
    text: 'I confirm this test signature request.'
});

const binaryPayload = (): SignDataPayload => ({
    type: 'binary',
    bytes: Buffer.from('I confirm this test signature request.', 'ascii').toString('base64')
});

const cellPayload = (): SignDataPayload => {
    const text = 'Test message in cell';
    const cell = beginCell().storeUint(text.length, 7).storeStringTail(text).endCell();
    return {
        type: 'cell',
        schema: 'message#_ len:uint7 {len <= 127} text:(bits len * 8) = Message;',
        cell: cell.toBoc().toString('base64')
    };
};

// When `enableEmbeddedRequest: true` returns `hasResponse: false`, the connect happened but no
// signature came back. The dApp must NOT auto-retry: with `dispatched: true` the wallet may
// already have signed the request and the signature is just lost in transit. Surface a button the
// user can press deliberately and warn loudly in the dangerous case.
type RetryPrompt = { payload: SignDataPayload; label: string; dispatched: boolean };

const JSON_LABEL_CLS =
    'mb-[6px] ml-[2px] mt-[18px] self-start text-[15px] font-medium tracking-[0.01em] text-[#b8d4f1]';

export function SignDataTester() {
    const wallet = useTonWallet();
    const [tonConnectUi] = useTonConnectUI();
    const [embeddedRequest, setEmbeddedRequest] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [signDataRequest, setSignDataRequest] = useState<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [signDataResponse, setSignDataResponse] = useState<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [verificationResult, setVerificationResult] = useState<any>(null);
    const [retryPrompt, setRetryPrompt] = useState<RetryPrompt | null>(null);

    const requestSign = async (payload: SignDataPayload, label: string) => {
        setSignDataRequest(payload);
        setSignDataResponse(null);
        setVerificationResult(null);
        setRetryPrompt(null);
        console.log(`📤 Sign Data Request (${label}):`, payload);

        try {
            let result: SignDataResponse;
            if (embeddedRequest) {
                const embedded = await tonConnectUi.signData(payload, {
                    enableEmbeddedRequest: true
                });
                if (!embedded.hasResponse) {
                    setRetryPrompt({
                        payload,
                        label,
                        dispatched: embedded.connectResult.dispatched
                    });
                    return;
                }
                result = embedded.response;
            } else {
                result = await tonConnectUi.signData(payload);
            }
            setSignDataResponse(result);
            console.log('📥 Sign Data Response:', result);
            if (wallet) {
                const verification = await TonProofDemoApi.checkSignData(result, wallet.account);
                setVerificationResult(verification);
                console.log('✅ Verification Result:', verification);
            }
        } catch (e) {
            console.error(`Error signing ${label}:`, e);
            setSignDataResponse({ error: e instanceof Error ? e.message : 'Unknown error' });
        }
    };

    return (
        <div className="mt-[60px] flex w-full flex-col items-center gap-5 p-5">
            <h3 className="text-white/80">Sign Data Test & Verification</h3>

            <div className="text-[18px] text-white/80">
                Test different types of data signing: text, binary, and cell formats with signature
                verification
            </div>

            <label className="ml-[2px] mt-3 text-[15px] font-medium text-[#b8d4f1]">
                <input
                    type="checkbox"
                    checked={embeddedRequest}
                    onChange={e => setEmbeddedRequest(e.target.checked)}
                />
                Embed request in connect
            </label>

            {wallet || embeddedRequest ? (
                <div className="flex flex-wrap justify-center gap-5">
                    <button
                        className="demo-btn"
                        onClick={() => requestSign(textPayload(), 'Text')}
                        disabled={Boolean(retryPrompt)}
                    >
                        Sign Text
                    </button>
                    <button
                        className="demo-btn"
                        onClick={() => requestSign(binaryPayload(), 'Binary')}
                        disabled={Boolean(retryPrompt)}
                    >
                        Sign Binary
                    </button>
                    <button
                        className="demo-btn"
                        onClick={() => requestSign(cellPayload(), 'Cell')}
                        disabled={Boolean(retryPrompt)}
                    >
                        Sign Cell
                    </button>
                </div>
            ) : (
                <div className="text-[18px] leading-5 text-[rgba(102,170,238,0.91)]">
                    Connect wallet to test signing
                </div>
            )}

            {retryPrompt && (
                <div
                    className={`my-3 rounded-lg border p-3 text-sm leading-[1.45] text-[#f0f6fb] ${
                        retryPrompt.dispatched
                            ? 'border-[#c14a4a] bg-[#5a2424]'
                            : 'border-[#3a6a90] bg-[#1f3a52]'
                    }`}
                >
                    <strong>
                        {retryPrompt.dispatched
                            ? '⚠️ Signature may already exist'
                            : 'Request not delivered'}
                    </strong>
                    <p className="mb-2.5 mt-1.5">
                        {retryPrompt.dispatched ? (
                            <>
                                The {retryPrompt.label.toLowerCase()} sign request was delivered to
                                the wallet inside the connect URL but no signature came back. The
                                wallet may have already signed it. Confirm with the user before
                                retrying — otherwise you may collect a second signature for the same
                                payload.
                            </>
                        ) : (
                            <>
                                The wallet connected but did not receive the request. It is safe to
                                ask the wallet to sign again over the bridge.
                            </>
                        )}
                    </p>
                    <button
                        className="demo-btn"
                        onClick={() => requestSign(retryPrompt.payload, retryPrompt.label)}
                    >
                        Retry signing ({retryPrompt.label})
                    </button>
                    <button
                        className="demo-btn ml-2 bg-transparent"
                        onClick={() => setRetryPrompt(null)}
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {signDataRequest && (
                <div className="w-full max-w-[800px] text-left">
                    <div className={JSON_LABEL_CLS}>📤 Sign Data Request</div>
                    <div className="w-full">
                        <ReactJson
                            src={signDataRequest}
                            name={false}
                            theme="ocean"
                            collapsed={false}
                        />
                    </div>
                </div>
            )}

            {signDataResponse && (
                <div className="w-full max-w-[800px] text-left">
                    <div className={JSON_LABEL_CLS}>📥 Sign Data Response</div>
                    <div className="w-full">
                        <ReactJson
                            src={signDataResponse}
                            name={false}
                            theme="ocean"
                            collapsed={false}
                        />
                    </div>
                </div>
            )}

            {verificationResult && (
                <div className="w-full max-w-[800px] text-left">
                    <div className={JSON_LABEL_CLS}>✅ Verification Result</div>
                    <div className="w-full">
                        <ReactJson
                            src={verificationResult}
                            name={false}
                            theme="ocean"
                            collapsed={false}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
