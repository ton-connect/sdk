/* eslint-disable no-console */
import './style.scss';
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

        // Get user's wallet address and convert to non-bounceable format
        let userAddress = '';
        if (wallet && wallet.account) {
            try {
                // Convert to Address object then to non-bounceable format
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

        // Create array with 'count' messages
        const messages = Array(count)
            .fill(null)
            .map(() => ({
                // Send to user's own wallet address in non-bounceable format
                address: userAddress,
                // Small amount to send in nanoTON (0.00001 TON = 10000 nanoTON)
                amount: '10000'
            }));

        return {
            validUntil,
            messages
        };
    };

    // Run the selected action with specified number of messages
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
        <div className="wallet-batch-limits-tester">
            <h3>Batch Message Limits Test</h3>

            <div className="wallet-batch-limits-tester__info">
                Send multiple messages to the wallet to test message batching capabilities
            </div>

            <div className="wallet-batch-limits-tester__mode">
                <label>
                    <input
                        type="radio"
                        name="batch-tester-mode"
                        value="sendTransaction"
                        checked={mode === 'sendTransaction'}
                        onChange={() => setMode('sendTransaction')}
                    />
                    Send Transaction
                </label>
                <label>
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
                <div className="wallet-batch-limits-tester__buttons">
                    {[4, 5, 255, 256].map(count => (
                        <button key={count} onClick={() => handleAction(count)}>
                            Test with {count} Messages
                        </button>
                    ))}
                </div>
            ) : (
                <div className="wallet-batch-limits-tester__error">
                    Connect wallet to test batch limits
                </div>
            )}
        </div>
    );
}
