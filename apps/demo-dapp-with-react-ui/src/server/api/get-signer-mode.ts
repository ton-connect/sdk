import { HttpResponseResolver } from 'msw';
import { getSignerMode } from '../services/signature-verification-service';
import { ok } from '../utils/http-utils';

export const getSignerModeHandler: HttpResponseResolver = async () => {
    return ok({ mode: getSignerMode() });
};
