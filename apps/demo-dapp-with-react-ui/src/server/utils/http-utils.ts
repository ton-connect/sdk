import { HttpResponse, JsonBodyType, StrictResponse } from 'msw';
import { Address, Cell } from '@ton/core';

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

export function jsonReplacer(_key: string, value: unknown): unknown {
    if (typeof value === 'bigint') {
        return value.toString();
    } else if (value instanceof Address) {
        return value.toString();
    } else if (value instanceof Cell) {
        return value.toBoc().toString('base64');
    } else if (value instanceof Buffer) {
        return value.toString('base64');
    } else if (
        value &&
        typeof value === 'object' &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (value as any).type === 'Buffer' &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Array.isArray((value as any).data)
    ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return Buffer.from((value as any).data).toString('base64');
    }

    return value;
}
