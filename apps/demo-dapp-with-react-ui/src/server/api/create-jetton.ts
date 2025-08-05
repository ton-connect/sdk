import {JettonMinter, storeJettonMintMessage} from "@ton-community/assets-sdk";
import {internalOnchainContentToCell} from "@ton-community/assets-sdk/dist/utils";
import {beginCell, storeStateInit, toNano} from "@ton/core";
import {Address} from "@ton/ton";
import {CHAIN} from "@tonconnect/sdk";
import {HttpResponseResolver} from "msw";
import {CreateJettonRequest} from "../dto/create-jetton-request-dto";
import {badRequest, ok, unauthorized} from "../utils/http-utils";
import {decodeAuthToken, verifyToken} from "../utils/jwt";

const VALID_UNTIL = 1000 * 60 * 5; // 5 minutes

/**
 * Checks the proof and returns an access token.
 *
 * POST /api/create_jetton
 */
export const createJetton: HttpResponseResolver = async ({request}) => {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token || !await verifyToken(token)) {
      return unauthorized({error: 'Unauthorized'});
    }

    const payload = decodeAuthToken(token);
    if (!payload?.address || !payload?.network) {
      return unauthorized({error: 'Invalid token'});
    }

    const body = CreateJettonRequest.parse(await request.json());

    // specify the time until the message is valid
    const validUntil = Math.round((Date.now() + VALID_UNTIL) / 1000);

    // amount of TON to send with the message
    const amount = toNano('0.06').toString();
    // forward value for the message to the wallet
    const walletForwardValue = toNano('0.05');

    // who send the jetton create message
    const senderAddress = Address.parse(payload.address);
    // who will be the owner of the jetton
    const ownerAddress = Address.parse(payload.address);
    // who will receive the jetton
    const receiverAddress = Address.parse(payload.address);

    // create a jetton master
    const jettonMaster = JettonMinter.createFromConfig({
      admin: ownerAddress,
      content: internalOnchainContentToCell({
        name: body.name,
        description: body.description,
        image_data: Buffer.from(body.image_data, 'ascii').toString('base64'),
        symbol: body.symbol,
        decimals: body.decimals,
      }),
    });
    if (!jettonMaster.init) {
      return badRequest({error: 'Invalid jetton master'});
    }

    // prepare jetton master address
    const jettonMasterAddress = jettonMaster.address.toString({
      urlSafe: true,
      bounceable: true,
      testOnly: payload.network === CHAIN.TESTNET
    });

    // prepare stateInit for the jetton deploy message
    const stateInitBase64 = beginCell()
      .store(storeStateInit(jettonMaster.init))
      .endCell().toBoc().toString('base64');

    // prepare payload for the jetton mint message
    const payloadBase64 = beginCell().store(storeJettonMintMessage({
      queryId: 0n,
      amount: BigInt(body.amount),
      from: jettonMaster.address,
      to: receiverAddress,
      responseAddress: senderAddress,
      forwardPayload: null,
      forwardTonAmount: 1n,
      walletForwardValue: walletForwardValue,
    })).endCell().toBoc().toString('base64');

    return ok({
      validUntil: validUntil,
      from: senderAddress.toRawString(),
      messages: [
        {
          address: jettonMasterAddress,
          amount: amount,
          stateInit: stateInitBase64,
          payload: payloadBase64
        }
      ]
    });
  } catch (e) {
    if (e instanceof Error) {
      return badRequest({error: 'Invalid request', trace: e.message});
    }
    return badRequest({error: 'Invalid request', trace: e});
  }
}
