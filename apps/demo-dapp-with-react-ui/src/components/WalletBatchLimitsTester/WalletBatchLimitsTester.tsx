/* eslint-disable no-console */
import {
    SendTransactionRequest,
    SignMessageRequest,
    useTonConnectUI,
    useTonWallet
} from '@tonconnect/ui-react';
import { Address } from '@ton/ton';
import { useState } from 'react';

type Mode = 'sendTransaction' | 'signMessage';

// Component to test wallet batch message limits for sendTransaction / signMessage
export function WalletBatchLimitsTester() {
    const wallet = useTonWallet();
    const [tonConnectUi] = useTonConnectUI();
    const [mode, setMode] = useState<Mode>('sendTransaction');

    const generateMultipleMessages = (
        count: number
    ): SendTransactionRequest & SignMessageRequest => {
        const validUntil = Math.floor(Date.now() / 1000) + 600;

        let userAddress = '';
        if (wallet && wallet.account) {
            try {
                const address = Address.parse(wallet.account.address);
                userAddress = address.toString({
                    urlSafe: true,
                    bounceable: false
                });
            } catch (e) {
                console.error('Error converting address:', e);
                userAddress = wallet.account.address;
            }
        }

        const messages = Array(count)
            .fill(null)
            .map(() => ({
                address: userAddress,
                amount: '10000'
            }));

        return {
            validUntil,
            messages
        };
    };

    const handleAction = async (count: number) => {
        const request = generateMultipleMessages(count);
        try {
            if (mode === 'sendTransaction') {
                const result = await tonConnectUi.sendTransaction(request);
                console.log(`📥 sendTransaction Response (${count} messages):`, result);
            } else {
                const result = await tonConnectUi.signMessage(request);
                console.log(`📥 signMessage Response (${count} messages):`, result);
            }
        } catch (e) {
            console.error(`Error in ${mode} with ${count} messages:`, e);
        }
    };

    return (
        <div className="mt-[60px] flex w-full flex-col items-center gap-5 p-5">
            <h3 className="text-white/80">Batch Message Limits Test</h3>

            <div className="text-[18px] text-white/80">
                Send multiple messages to the wallet to test message batching capabilities
            </div>

            <div className="flex gap-5 text-base text-white">
                <label className="flex cursor-pointer items-center gap-1.5">
                    <input
                        type="radio"
                        name="batch-tester-mode"
                        value="sendTransaction"
                        checked={mode === 'sendTransaction'}
                        onChange={() => setMode('sendTransaction')}
                    />
                    Send Transaction
                </label>
                <label className="flex cursor-pointer items-center gap-1.5">
                    <input
                        type="radio"
                        name="batch-tester-mode"
                        value="signMessage"
                        checked={mode === 'signMessage'}
                        onChange={() => setMode('signMessage')}
                    />
                    Sign Message
                </label>
            </div>

            {wallet ? (
                <div className="flex flex-wrap justify-center gap-5">
                    {[4, 5, 255, 256].map(count => (
                        <button
                            className="demo-btn"
                            key={count}
                            onClick={() => handleAction(count)}
                        >
                            Test with {count} Messages
                        </button>
                    ))}
                </div>
            ) : (
                <div className="text-[18px] leading-5 text-[rgba(102,170,238,0.91)]">
                    Connect wallet to test batch limits
                </div>
            )}
        </div>
    );
}
