import { beginCell, Cell, storeStateInit, toNano } from '@ton/core';
import { Address } from '@ton/ton';
import { CHAIN } from '@tonconnect/sdk';
import { HttpResponseResolver } from 'msw';
import { badRequest, ok, unauthorized } from '../utils/http-utils';
import { decodeAuthToken, verifyToken } from '../utils/jwt';
import { buildSuccessMerkleProof, buildVerifyMerkleProof, Exotic } from '../utils/exotic';
import { Buffer } from 'buffer';

const VALID_UNTIL = 1000 * 60 * 5; // 5 minutes
const EXOTIC_CODE = Cell.fromBoc(
    Buffer.from(
        'b5ee9c7241020501000116000114ff00f4a413f4bcf2c80b01020162020401f8d020d749c120915be001d0d3030171b0c001915be0fa403001d31f01208210c5375235ba8e4e30d3ffd4300101d7399ed30701c003925b70e1d3ff3001ba925b70e2948b24f4b8978b54552524f528e2708040c87001cb1f5003cf16c8801001cb055004cf1601fa027001cb6a58cf17c901fb00e020821036ca91200300f6ba8e4e30d3ffd4300101d7399ed30701c004925b70e1d3ff3001ba925b70e2948b24f4b8978b54552524f528e2708040c87001cb1f5003cf16c8801001cb055004cf1601fa027001cb6a58cf17c901fb00e082100bc2883bba8e1aed44d00281200103c70512f2f49320d74a96d307d402fb00e830e05b840ff2f0000ba0734bda89a1de6635a5',
        'hex'
    )
)[0]!;

/**
 * Checks the proof and returns an access token.
 *
 * POST /api/merkle_proof
 */
export const merkleProof: HttpResponseResolver = async ({ request }) => {
    try {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '');

        if (!token || !(await verifyToken(token))) {
            return unauthorized({ error: `Unauthorized unverified token ${token}` });
        }

        const payload = decodeAuthToken(token);
        if (!payload?.address) {
            return unauthorized({ error: 'Invalid token' });
        }

        // specify the time until the message is valid
        const validUntil = Math.round((Date.now() + VALID_UNTIL) / 1000);

        // amount of TON to send with the message
        const amount = toNano('0.06').toString();
        // forward value for the message to the wallet
        // const walletForwardValue = toNano('0.05');

        const senderAddress = Address.parse(payload.address);
        const ownerAddress = Address.parse(payload.address);
        // const receiverAddress = Address.parse(payload.address);

        const exotic = Exotic.createFromConfig(
            {
                owner: ownerAddress
            },
            EXOTIC_CODE
        );

        if (!exotic.init) {
            return badRequest({ error: 'Invalid exotic' });
        }

        // prepare jetton master address
        const exoticAdress = exotic.address.toString({
            urlSafe: true,
            bounceable: true,
            testOnly: payload.network === CHAIN.TESTNET
        });

        // prepare stateInit for the merkle proof deploy message
        const stateInitBase64 = beginCell()
            .store(storeStateInit(exotic.init))
            .endCell()
            .toBoc()
            .toString('base64');

        // prepare payload for the jetton mint message
        const merkleProofBody = buildVerifyMerkleProof(buildSuccessMerkleProof());

        return ok({
            validUntil: validUntil,
            from: senderAddress.toRawString(),
            messages: [
                {
                    address: exoticAdress,
                    amount: amount,
                    stateInit: stateInitBase64,
                    payload: merkleProofBody.toBoc().toString('base64')
                }
            ]
        });
    } catch (e) {
        if (e instanceof Error) {
            return badRequest({ error: 'Invalid request', trace: e.message });
        }
        return badRequest({ error: 'Invalid request', trace: e });
    }
};
