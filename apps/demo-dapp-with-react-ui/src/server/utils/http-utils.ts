import { HttpResponse, JsonBodyType, StrictResponse } from 'msw';

import { jsonReplacer } from '../../core/utils/json-replacer';

export { jsonReplacer } from '../../core/utils/json-replacer';

/**
 * Receives a body and returns an HTTP response with the given body and status code 200.
 */
export function ok<T extends object>(body: T): StrictResponse<JsonBodyType> {
    return HttpResponse.text(JSON.stringify(body, jsonReplacer, 2), {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' }
    });
}

/**
 * Receives a body and returns an HTTP response with the given body and status code 400.
 */
export function badRequest<T extends object>(body: T): StrictResponse<JsonBodyType> {
    return HttpResponse.json(body, {
        status: 400,
        statusText: 'Bad Request'
    });
}

/**
 * Receives a body and returns an HTTP response with the given body and status code 401.
 */
export function unauthorized<T extends object>(body: T): StrictResponse<JsonBodyType> {
    return HttpResponse.json(body, {
        status: 401,
        statusText: 'Unauthorized'
    });
}

export function notFound<T extends object>(body: T): StrictResponse<JsonBodyType> {
    return HttpResponse.json(body, {
        status: 404,
        statusText: 'Not Found'
    });
}
