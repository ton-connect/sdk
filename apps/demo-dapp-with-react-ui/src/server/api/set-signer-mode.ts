import { HttpResponseResolver } from 'msw';
import { badRequest, ok } from '../utils/http-utils';
import { setSignerMode, SignerMode } from '../services/signature-verification-service';

type Body = {
    mode: SignerMode;
};

export const setSignerModeHandler: HttpResponseResolver = async ({ request }) => {
    try {
        const body = (await request.json()) as Body;

        if (body.mode !== 'domain-signature' && body.mode !== 'mixed') {
            return badRequest({ error: 'Invalid signer mode' });
        }

        setSignerMode(body.mode);

        return ok({ mode: body.mode });
    } catch (e) {
        return badRequest({ error: 'Invalid request', trace: e });
    }
};
