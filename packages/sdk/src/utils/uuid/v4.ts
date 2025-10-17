/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2010-2020 Robert Kieffer and other contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { randomUUID } from './native-browser';
import { rng } from './rng-browser';
import { unsafeStringify } from './stringify';
import { UUIDTypes, Version4Options } from './types';

function _v4<TBuf extends Uint8Array = Uint8Array>(
    options?: Version4Options,
    buf?: TBuf,
    offset?: number
): UUIDTypes<TBuf> {
    options = options || {};

    const rnds = options.random ?? options.rng?.() ?? rng();
    if (rnds.length < 16) {
        throw new Error('Random bytes length must be >= 16');
    }

    // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
    rnds[6] = (rnds[6]! & 0x0f) | 0x40;
    rnds[8] = (rnds[8]! & 0x3f) | 0x80;

    // Copy bytes to buffer, if provided
    if (buf) {
        offset = offset || 0;
        if (offset < 0 || offset + 16 > buf.length) {
            throw new RangeError(
                `UUID byte range ${offset}:${offset + 15} is out of buffer bounds`
            );
        }

        for (let i = 0; i < 16; ++i) {
            buf[offset + i] = rnds[i]!;
        }

        return buf;
    }

    return unsafeStringify(rnds);
}

export function UUIDv4(options?: Version4Options, buf?: undefined, offset?: number): string;
export function UUIDv4<TBuf extends Uint8Array = Uint8Array>(
    options: Version4Options | undefined,
    buf: TBuf,
    offset?: number
): TBuf;
export function UUIDv4<TBuf extends Uint8Array = Uint8Array>(
    options?: Version4Options,
    buf?: TBuf,
    offset?: number
): UUIDTypes<TBuf> {
    if (randomUUID && !buf && !options) {
        return randomUUID();
    }

    // Putting tail-code that could just go inline here in a separate function
    // allows for compiler optimizations that dramatically improve performance.
    //
    // REF: https://github.com/uuidjs/uuid/issues/892
    return _v4(options, buf, offset);
}
