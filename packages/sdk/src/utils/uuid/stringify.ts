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

import { validate } from './validate';

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
const byteToHex: string[] = [];

for (let i = 0; i < 256; ++i) {
    byteToHex.push((i + 0x100).toString(16).slice(1));
}

export function unsafeStringify(arr: Uint8Array, offset = 0): string {
    // Note: Be careful editing this code!  It's been tuned for performance
    // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
    //
    // Note to future-self: No, you can't remove the `toLowerCase()` call.
    // REF: https://github.com/uuidjs/uuid/pull/677#issuecomment-1757351351
    return (
        byteToHex[arr[offset + 0]!]! +
        byteToHex[arr[offset + 1]!] +
        byteToHex[arr[offset + 2]!] +
        byteToHex[arr[offset + 3]!] +
        '-' +
        byteToHex[arr[offset + 4]!] +
        byteToHex[arr[offset + 5]!] +
        '-' +
        byteToHex[arr[offset + 6]!] +
        byteToHex[arr[offset + 7]!] +
        '-' +
        byteToHex[arr[offset + 8]!] +
        byteToHex[arr[offset + 9]!] +
        '-' +
        byteToHex[arr[offset + 10]!] +
        byteToHex[arr[offset + 11]!] +
        byteToHex[arr[offset + 12]!] +
        byteToHex[arr[offset + 13]!] +
        byteToHex[arr[offset + 14]!] +
        byteToHex[arr[offset + 15]!]
    ).toLowerCase();
}

export function stringify(arr: Uint8Array, offset = 0) {
    const uuid = unsafeStringify(arr, offset);

    // Consistency check for valid UUID.  If this throws, it's likely due to one
    // of the following:
    // - One or more input array values don't map to a hex octet (leading to
    // "undefined" in the uuid)
    // - Invalid input values for the RFC `version` or `variant` fields
    if (!validate(uuid)) {
        throw TypeError('Stringified UUID is invalid');
    }

    return uuid;
}
