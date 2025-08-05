import {HttpResponseResolver} from "msw";
import {TonApiService} from "../services/ton-api-service";
import {badRequest, ok, unauthorized} from "../utils/http-utils";
import {decodeAuthToken, verifyToken} from "../utils/jwt";

/**
 * Returns account info.
 *
 * GET /api/get_account_info
 */
export const getAccountInfo: HttpResponseResolver = async ({request}) => {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token || !await verifyToken(token)) {
      return unauthorized({error: 'Unauthorized'});
    }

    const payload = decodeAuthToken(token);
    if (!payload?.address || !payload?.network) {
      return unauthorized({error: 'Invalid token'});
    }

    const client = TonApiService.create(payload.network);

    return ok(await client.getAccountInfo(payload.address));
  } catch (e) {
    return badRequest({error: 'Invalid request', trace: e});
  }
};
