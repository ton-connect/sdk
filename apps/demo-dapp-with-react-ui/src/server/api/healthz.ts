import {HttpResponseResolver} from "msw";
import {ok} from "../utils/http-utils";

export const healthz: HttpResponseResolver = async () => {
  return ok({ok: true});
};
