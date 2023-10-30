import { WrongAddressError, ParseHexError } from 'src/errors';
import { Base64 } from '@tonconnect/protocol';

const noBounceableTag = 0x51;
const testOnlyTag = 0x80;

/**
 * Converts raw TON address to no-bounceable user-friendly format. [See details]{@link https://ton.org/docs/learn/overviews/addresses#user-friendly-address}
 * @param hexAddress raw TON address formatted as "0:<hex string without 0x>".
 * @param [testOnly=false] convert address to test-only form. [See details]{@link https://ton.org/docs/learn/overviews/addresses#user-friendly-address}
 */
export function toUserFriendlyAddress(hexAddress: string, testOnly = false): string {
    const { wc, hex } = parseHexAddress(hexAddress);

    let tag = noBounceableTag;
    if (testOnly) {
        tag |= testOnlyTag;
    }

    const addr = new Int8Array(34);
    addr[0] = tag;
    addr[1] = wc;
    addr.set(hex, 2);

    const addressWithChecksum = new Uint8Array(36);
    addressWithChecksum.set(addr);
    addressWithChecksum.set(crc16(addr), 34);

    let addressBase64 = Base64.encode(addressWithChecksum);

    return addressBase64.replace(/\+/g, '-').replace(/\//g, '_');
}

function parseHexAddress(hexAddress: string): { wc: 0 | -1; hex: Uint8Array } {
    if (!hexAddress.includes(':')) {
        throw new WrongAddressError(`Wrong address ${hexAddress}. Address must include ":".`);
    }

    const parts = hexAddress.split(':');
    if (parts.length !== 2) {
        throw new WrongAddressError(
            `Wrong address ${hexAddress}. Address must include ":" only once.`
        );
    }

    const wc = parseInt(parts[0]!);
    if (wc !== 0 && wc !== -1) {
        throw new WrongAddressError(
            `Wrong address ${hexAddress}. WC must be eq 0 or -1, but ${wc} received.`
        );
    }

    const hex = parts[1];
    if (hex?.length !== 64) {
        throw new WrongAddressError(
            `Wrong address ${hexAddress}. Hex part must be 64bytes length, but ${hex?.length} received.`
        );
    }

    return {
        wc,
        hex: hexToBytes(hex)
    };
}

function crc16(data: ArrayLike<number>): Uint8Array {
    const poly = 0x1021;
    let reg = 0;
    const message = new Uint8Array(data.length + 2);
    message.set(data);
    for (let byte of message) {
        let mask = 0x80;
        while (mask > 0) {
            reg <<= 1;
            if (byte & mask) {
                reg += 1;
            }
            mask >>= 1;
            if (reg > 0xffff) {
                reg &= 0xffff;
                reg ^= poly;
            }
        }
    }
    return new Uint8Array([Math.floor(reg / 256), reg % 256]);
}

const toByteMap: Record<string, number> = {};
for (let ord = 0; ord <= 0xff; ord++) {
    let s = ord.toString(16);
    if (s.length < 2) {
        s = '0' + s;
    }
    toByteMap[s] = ord;
}

function hexToBytes(hex: string): Uint8Array {
    hex = hex.toLowerCase();
    const length2 = hex.length;
    if (length2 % 2 !== 0) {
        throw new ParseHexError('Hex string must have length a multiple of 2: ' + hex);
    }
    const length = length2 / 2;
    const result = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
        const doubled = i * 2;
        const hexSubstring = hex.substring(doubled, doubled + 2);
        if (!toByteMap.hasOwnProperty(hexSubstring)) {
            throw new ParseHexError('Invalid hex character: ' + hexSubstring);
        }
        result[i] = toByteMap[hexSubstring]!;
    }
    return result;
}
