import './style.scss';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import React, { useState } from 'react';
import ReactJson from 'react-json-view';
import { Address, beginCell, toNano } from '@ton/core';
import { storeJettonTransferMessage } from '@ton-community/assets-sdk';

export function SignMessageDemo() {
    const wallet = useTonWallet();
    const [tonConnectUi] = useTonConnectUI();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [signMessageRequest, setSignMessageRequest] = useState<any | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [signMessageResponse, setSignMessageResponse] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fallbackAddress = 'EQCKWpx7cNMpvmcN5ObM5lLUZHZRFKqYA4xmw9jOry0ZsF9M';

    const handleSignSimpleTonMessage = async () => {
        if (!wallet) {
            tonConnectUi.openModal();
            return;
        }

        setError(null);
        setSignMessageRequest(null);
        setSignMessageResponse(null);

        const toAddress = wallet.account.address ?? fallbackAddress;

        const request = {
            validUntil: Math.floor(Date.now() / 1000) + 600,
            network: wallet.account.chain,
            messages: [
                {
                    address: toAddress,
                    amount: '1000000'
                }
            ]
        };

        setSignMessageRequest(request);

        try {
            const result = await tonConnectUi.signMessage(request);
            setSignMessageResponse(result);
        } catch (e) {
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError('Unknown error');
            }
        }
    };

    const handleSignJettonLikeMessage = async () => {
        if (!wallet) {
            tonConnectUi.openModal();
            return;
        }

        setError(null);
        setSignMessageRequest(null);
        setSignMessageResponse(null);

        const ownerAddress = wallet.account.address ?? fallbackAddress;
        const owner = Address.parse(ownerAddress);

        const destination = owner;

        const transferBody = beginCell()
            .store(
                storeJettonTransferMessage({
                    queryId: 0n,
                    amount: toNano('0.01'),
                    destination,
                    responseDestination: owner,
                    customPayload: null,
                    forwardAmount: toNano('0.001'),
                    forwardPayload: beginCell()
                        .storeUint(0, 32)
                        .storeStringTail('signMessage jetton demo')
                        .endCell()
                })
            )
            .endCell()
            .toBoc()
            .toString('base64');

        const jettonWalletAddress = owner;

        const request = {
            validUntil: Math.floor(Date.now() / 1000) + 600,
            network: wallet.account.chain,
            messages: [
                {
                    address: jettonWalletAddress.toString({ urlSafe: true, bounceable: true }),
                    amount: toNano('0.05').toString(),
                    payload: transferBody
                }
            ]
        };

        setSignMessageRequest(request);

        try {
            const result = await tonConnectUi.signMessage(request);
            setSignMessageResponse(result);
        } catch (e) {
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError('Unknown error');
            }
        }
    };

    return (
        <div className="sign-message-demo">
            <h3>Sign Message Demo</h3>

            <div className="sign-message-demo__info">
                Sign TON messages without sending them. Includes a simple TON transfer and a
                jetton-like transfer payload.
            </div>

            {wallet ? (
                <div className="sign-message-demo__buttons">
                    <button onClick={handleSignSimpleTonMessage}>Sign simple TON message</button>
                    <button onClick={handleSignJettonLikeMessage}>Sign jetton-like message</button>
                </div>
            ) : (
                <div className="sign-message-demo__error">
                    Connect wallet to try signMessage examples
                </div>
            )}

            {error && <div className="sign-message-demo__error">Error: {error}</div>}

            {signMessageRequest && (
                <div className="sign-message-demo__debug">
                    <h4>📤 Sign Message Request</h4>
                    <ReactJson
                        src={signMessageRequest}
                        name={false}
                        theme="ocean"
                        collapsed={false}
                    />
                </div>
            )}

            {signMessageResponse && (
                <div className="sign-message-demo__debug">
                    <h4>📥 Sign Message Response</h4>
                    <ReactJson
                        src={signMessageResponse}
                        name={false}
                        theme="ocean"
                        collapsed={false}
                    />
                </div>
            )}
        </div>
    );
}
