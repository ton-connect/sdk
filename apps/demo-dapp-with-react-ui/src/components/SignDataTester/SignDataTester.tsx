/* eslint-disable no-console */
import './style.scss';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { beginCell } from '@ton/ton';
import { useState } from 'react';
import ReactJson from 'react-json-view';
import { TonProofDemoApi } from '../../TonProofDemoApi';

// Component to test SignData functionality
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

    // Handle text signing
    const handleTextSign = async () => {
        // Clear previous state
        setSignDataRequest(null);
        setSignDataResponse(null);
        setVerificationResult(null);

        try {
            const requestPayload = {
                type: 'text' as const,
                text: 'I confirm this test signature request.'
            };

            setSignDataRequest(requestPayload);
            console.log('📤 Sign Data Request (Text):', requestPayload);

            const result = await tonConnectUi.signData(requestPayload, {
                onConnected: embeddedRequest
                    ? (send, { dispatched }) => {
                          if (dispatched && !confirm('Sign data twice?')) {
                              throw new Error('Sign data twice');
                          }
                          return send();
                      }
                    : undefined
            });

            setSignDataResponse(result);
            console.log('📥 Sign Data Response (Text):', result);

            // Verify the signature
            if (wallet) {
                const verification = await TonProofDemoApi.checkSignData(result, wallet.account);
                setVerificationResult(verification);
                console.log('✅ Verification Result (Text):', verification);
            }
        } catch (e) {
            console.error('Error signing text:', e);
            if (e instanceof Error) {
                setSignDataResponse({ error: e.message });
            } else {
                setSignDataResponse({ error: 'Unknown error' });
            }
        }
    };

    // Handle binary signing
    const handleBinarySign = async () => {
        // Clear previous state
        setSignDataRequest(null);
        setSignDataResponse(null);
        setVerificationResult(null);

        try {
            // Example binary data (random bytes)
            const binaryData = Buffer.from('I confirm this test signature request.', 'ascii');
            const requestPayload = {
                type: 'binary' as const,
                bytes: binaryData.toString('base64')
            };

            setSignDataRequest(requestPayload);
            console.log('📤 Sign Data Request (Binary):', requestPayload);

            const result = await tonConnectUi.signData(requestPayload, {
                onConnected: embeddedRequest
                    ? (send, { dispatched }) => {
                          if (dispatched && !confirm('Sign data twice?')) {
                              throw new Error('Sign data twice');
                          }
                          return send();
                      }
                    : undefined
            });

            setSignDataResponse(result);
            console.log('📥 Sign Data Response (Binary):', result);

            // Verify the signature
            if (wallet) {
                const verification = await TonProofDemoApi.checkSignData(result, wallet.account);
                setVerificationResult(verification);
                console.log('✅ Verification Result (Binary):', verification);
            }
        } catch (e) {
            console.error('Error signing binary:', e);
            if (e instanceof Error) {
                setSignDataResponse({ error: e.message });
            } else {
                setSignDataResponse({ error: 'Unknown error' });
            }
        }
    };

    // Handle cell signing
    const handleCellSign = async () => {
        // Clear previous state
        setSignDataRequest(null);
        setSignDataResponse(null);
        setVerificationResult(null);

        try {
            // Create a simple cell with a message
            const text = 'Test message in cell';
            const cell = beginCell()
                .storeUint(text.length, 7) // length
                .storeStringTail(text)
                .endCell();

            const requestPayload = {
                type: 'cell' as const,
                schema: 'message#_ len:uint7 {len <= 127} text:(bits len * 8) = Message;',
                cell: cell.toBoc().toString('base64')
            };

            setSignDataRequest(requestPayload);
            console.log('📤 Sign Data Request (Cell):', requestPayload);

            const result = await tonConnectUi.signData(requestPayload, {
                onConnected: embeddedRequest
                    ? (send, { dispatched }) => {
                          if (dispatched && !confirm('Sign data twice?')) {
                              throw new Error('Sign data twice');
                          }
                          return send();
                      }
                    : undefined
            });

            setSignDataResponse(result);
            console.log('📥 Sign Data Response (Cell):', result);

            // Verify the signature
            if (wallet) {
                const verification = await TonProofDemoApi.checkSignData(result, wallet.account);
                setVerificationResult(verification);
                console.log('✅ Verification Result (Cell):', verification);
            }
        } catch (e) {
            console.error('Error signing cell:', e);
            if (e instanceof Error) {
                setSignDataResponse({ error: e.message });
            } else {
                setSignDataResponse({ error: 'Unknown error' });
            }
        }
    };

    return (
        <div className="sign-data-tester">
            <h3>Sign Data Test & Verification</h3>

            <div className="sign-data-tester__info">
                Test different types of data signing: text, binary, and cell formats with signature
                verification
            </div>

            <label
                style={{ margin: '12px 0 0 2px', color: '#b8d4f1', fontWeight: 500, fontSize: 15 }}
            >
                <input
                    type="checkbox"
                    checked={embeddedRequest}
                    onChange={e => setEmbeddedRequest(e.target.checked)}
                />
                Embed request in connect
            </label>

            {wallet || embeddedRequest ? (
                <div className="sign-data-tester__buttons">
                    <button onClick={handleTextSign}>Sign Text</button>
                    <button onClick={handleBinarySign}>Sign Binary</button>
                    <button onClick={handleCellSign}>Sign Cell</button>
                </div>
            ) : (
                <div className="sign-data-tester__error">Connect wallet to test signing</div>
            )}

            {signDataRequest && (
                <div className="sign-data-tester__debug">
                    <div className="find-transaction-demo__json-label">📤 Sign Data Request</div>
                    <div className="find-transaction-demo__json-view">
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
                <div className="sign-data-tester__debug">
                    <div className="find-transaction-demo__json-label">📥 Sign Data Response</div>
                    <div className="find-transaction-demo__json-view">
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
                <div className="sign-data-tester__debug">
                    <div className="find-transaction-demo__json-label">✅ Verification Result</div>
                    <div className="find-transaction-demo__json-view">
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
