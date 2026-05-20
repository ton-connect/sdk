import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { toNano } from '@ton/core';
import { Wallet } from 'lucide-react';

import {
    // buildSuccessMerkleProof,
    buildSuccessMerkleUpdate,
    // buildVerifyMerkleProof,
    buildVerifyMerkleUpdate
} from '../../../server/utils/exotic';
import { Button } from '../../../core/components/ui/button/index';
import { EmptyState } from '../../../core/components/empty-state/index';
import { TonProofDemoApi } from '../../../core/lib/ton-proof-demo-api';

const merkleExampleAddress = 'EQD_5KMZVIqzYY91-t5CdRD_V71wRrVzxDXu9n2XEwz2wwdv';
const merkleUpdateBody = buildVerifyMerkleUpdate(buildSuccessMerkleUpdate());

export const MerkleExample = () => {
    const [tonConnectUI] = useTonConnectUI();
    const wallet = useTonWallet();

    const handleMerkleProofClick = async () => {
        const response = await TonProofDemoApi.merkleProof();

        if (!('error' in response)) {
            await tonConnectUI.sendTransaction(response);
        }
    };

    const handleMerkleUpdateClick = async () => {
        const myTransaction = {
            validUntil: Math.floor(Date.now() / 1000) + 360,
            messages: [
                {
                    address: merkleExampleAddress,
                    amount: toNano('0.05').toString(),
                    payload: merkleUpdateBody.toBoc().toString('base64')
                }
            ]
        };

        await tonConnectUI.sendTransaction(myTransaction);
    };

    if (!wallet) {
        return (
            <EmptyState
                icon={Wallet}
                title="Connect a wallet"
                description="A connected wallet is required to send a merkle proof or update transaction."
                action={<Button onClick={() => tonConnectUI.openModal()}>Connect wallet</Button>}
            />
        );
    }

    return (
        <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={handleMerkleProofClick}>Send merkle proof</Button>
            <Button onClick={handleMerkleUpdateClick}>Send merkle update</Button>
        </div>
    );
};
