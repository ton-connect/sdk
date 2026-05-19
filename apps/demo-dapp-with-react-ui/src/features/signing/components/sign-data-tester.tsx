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

import { Button } from '@/core/components/ui/button';
import { Checkbox } from '@/core/components/ui/checkbox';
import { ResultPanel } from '@/core/components/result-panel';
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
        <>
            <label className="flex cursor-pointer items-center gap-2 text-[15px] font-medium text-secondary-foreground">
                <Checkbox
                    checked={embeddedRequest}
                    onCheckedChange={v => setEmbeddedRequest(v === true)}
                />
                Embed request in connect
            </label>

            <div className="flex flex-wrap justify-center gap-3">
                <Button
                    onClick={() => requestSign(textPayload(), 'Text')}
                    disabled={Boolean(retryPrompt) || (!wallet && !embeddedRequest)}
                >
                    Sign Text
                </Button>
                <Button
                    onClick={() => requestSign(binaryPayload(), 'Binary')}
                    disabled={Boolean(retryPrompt) || (!wallet && !embeddedRequest)}
                >
                    Sign Binary
                </Button>
                <Button
                    onClick={() => requestSign(cellPayload(), 'Cell')}
                    disabled={Boolean(retryPrompt) || (!wallet && !embeddedRequest)}
                >
                    Sign Cell
                </Button>
            </div>

            {!wallet && !embeddedRequest && (
                <p className="text-sm text-secondary-foreground">
                    Connect a wallet, or toggle <em>Embed request in connect</em> to test signing.
                </p>
            )}

            {retryPrompt && (
                <div
                    className={`rounded-lg border p-3 text-sm leading-[1.45] text-foreground ${
                        retryPrompt.dispatched
                            ? 'border-error/40 bg-error/15'
                            : 'border-primary/40 bg-primary/10'
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
                    <div className="flex gap-2">
                        <Button onClick={() => requestSign(retryPrompt.payload, retryPrompt.label)}>
                            Retry signing ({retryPrompt.label})
                        </Button>
                        <Button variant="ghost" onClick={() => setRetryPrompt(null)}>
                            Dismiss
                        </Button>
                    </div>
                </div>
            )}

            {signDataRequest && (
                <ResultPanel title="📤 Sign Data Request">
                    <ReactJson src={signDataRequest} name={false} theme="ocean" collapsed={false} />
                </ResultPanel>
            )}

            {signDataResponse && (
                <ResultPanel title="📥 Sign Data Response">
                    <ReactJson
                        src={signDataResponse}
                        name={false}
                        theme="ocean"
                        collapsed={false}
                    />
                </ResultPanel>
            )}

            {verificationResult && (
                <ResultPanel title="✅ Verification Result">
                    <ReactJson
                        src={verificationResult}
                        name={false}
                        theme="ocean"
                        collapsed={false}
                    />
                </ResultPanel>
            )}
        </>
    );
}
