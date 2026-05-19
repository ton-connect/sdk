import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { toNano } from '@ton/core';
import {
    // buildSuccessMerkleProof,
    buildSuccessMerkleUpdate,
    // buildVerifyMerkleProof,
    buildVerifyMerkleUpdate
} from '../../server/utils/exotic';

import { TonProofDemoApi } from '../../TonProofDemoApi';

const merkleExampleAddress = 'EQD_5KMZVIqzYY91-t5CdRD_V71wRrVzxDXu9n2XEwz2wwdv';
// const merkleProofBody = buildVerifyMerkleProof(buildSuccessMerkleProof());
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

    return (
        <div className="mt-[60px] flex w-full flex-col items-center gap-5 p-5">
            <h3 className="text-white/80">Merkle proof/update</h3>
            {wallet ? (
                <div className="flex flex-wrap justify-center gap-5">
                    <button className="demo-btn" onClick={handleMerkleProofClick}>
                        Send merkle proof
                    </button>
                    <button className="demo-btn" onClick={handleMerkleUpdateClick}>
                        Send merkle update
                    </button>
                </div>
            ) : (
                <div className="text-[18px] leading-5 text-[rgba(102,170,238,0.91)]">
                    Connect wallet to send transaction
                </div>
            )}
        </div>
    );
};
