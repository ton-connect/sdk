/* eslint-disable no-console */
import {
    SendTransactionRequest,
    SignMessageRequest,
    useTonConnectUI,
    useTonWallet
} from '@tonconnect/ui-react';
import { Address } from '@ton/ton';
import { useState } from 'react';
import { Wallet } from 'lucide-react';

import { Button } from '@/core/components/ui/button';
import { RadioGroup } from '@/core/components/ui/radio-group';
import { EmptyState } from '@/core/components/empty-state';

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

    if (!wallet) {
        return (
            <EmptyState
                icon={Wallet}
                title="Connect a wallet"
                description="A connected wallet is required to send a batch of messages."
                action={<Button onClick={() => tonConnectUi.openModal()}>Connect wallet</Button>}
            />
        );
    }

    return (
        <>
            <RadioGroup
                value={mode}
                onValueChange={v => setMode(v as Mode)}
                name="batch-tester-mode"
                className="text-base text-foreground"
            >
                <label className="flex cursor-pointer items-center gap-2">
                    <RadioGroup.Item value="sendTransaction" />
                    Send Transaction
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                    <RadioGroup.Item value="signMessage" />
                    Sign Message
                </label>
            </RadioGroup>
            <div className="flex flex-wrap justify-center gap-3">
                {[4, 5, 255, 256].map(count => (
                    <Button key={count} onClick={() => handleAction(count)}>
                        Test with {count} Messages
                    </Button>
                ))}
            </div>
        </>
    );
}
