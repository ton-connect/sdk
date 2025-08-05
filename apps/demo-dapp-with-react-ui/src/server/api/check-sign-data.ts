import { HttpResponseResolver } from "msw";
import { CheckSignDataRequest } from "../dto/check-sign-data-request-dto";
import { TonApiService } from "../services/ton-api-service";
import { SignDataService } from "../services/sign-data-service";
import { badRequest, ok } from "../utils/http-utils";

/**
 * Checks the sign data signature and returns verification result.
 *
 * POST /api/check_sign_data
 */
export const checkSignData: HttpResponseResolver = async ({ request }) => {
  try {
    const body = CheckSignDataRequest.parse(await request.json());

    const client = TonApiService.create(body.network);
    const service = new SignDataService();

    const isValid = await service.checkSignData(body, (address) =>
      client.getWalletPublicKey(address)
    );

    if (!isValid) {
      return badRequest({ error: "Invalid signature" });
    }

    return ok({
      valid: true,
      message: "Signature verified successfully",
      payload: body.payload,
      address: body.address,
      timestamp: body.timestamp,
      domain: body.domain,
    });
  } catch (e) {
    return badRequest({ error: "Invalid request", trace: e });
  }
};
