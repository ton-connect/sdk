import {sha256} from "@ton/crypto";
import {HttpResponseResolver} from "msw";
import {TonProofService} from "../services/ton-proof-service";
import {badRequest, ok} from "../utils/http-utils";
import {createPayloadToken} from "../utils/jwt";

/**
 * Generates a payload for ton proof.
 *
 * POST /api/generate_payload
 */
export const generatePayload: HttpResponseResolver = async () => {
  try {
    const service = new TonProofService();

    const randomBytes = await service.generateRandomBytes();
    const payloadToken = await createPayloadToken({
      randomBytes: randomBytes.toString('hex')
    });
    const payloadTokenHash = (await sha256(payloadToken)).toString('hex');

    return ok({
      payloadToken: payloadToken,
      payloadTokenHash: payloadTokenHash,
    });
  } catch (e) {
    return badRequest({error: 'Invalid request', trace: e});
  }
};
