import { toNano } from '@ton/core';
import type { SendTransactionRequest } from '@tonconnect/ui-react';

import { buildSuccessMerkleUpdate, buildVerifyMerkleUpdate } from '../../../server/utils/exotic';

import { MERKLE_EXAMPLE_ADDRESS } from './merkle-demo-constants';

const merkleUpdateBody = buildVerifyMerkleUpdate(buildSuccessMerkleUpdate());

export function buildMerkleUpdateTransaction(): SendTransactionRequest {
    return {
        validUntil: Math.floor(Date.now() / 1000) + 360,
        messages: [
            {
                address: MERKLE_EXAMPLE_ADDRESS,
                amount: toNano('0.05').toString(),
                payload: merkleUpdateBody.toBoc().toString('base64')
            }
        ]
    };
}
