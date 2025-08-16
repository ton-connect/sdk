import { WrongAddressError, ParseHexError } from 'src/errors';
import { Base64 } from '@tonconnect/protocol';

const BounceableTag = 0x11;
const noBounceableTag = 0x51;
const testOnlyTag = 0x80;

/**
 * Converts raw TON address to no-bounceable user-friendly format. [See details]{@link https://ton.org/docs/learn/overviews/addresses#user-friendly-address}
 * @param hexAddress raw TON address formatted as "0:<hex string without 0x>".
 * @param [testOnly=false] convert address to test-only form. [See details]{@link https://ton.org/docs/learn/overviews/addresses#user-friendly-address}
 */
export function toUserFriendlyAddress(hexAddress: string, testOnly = false, bounceable = false): string {
    const { wc, hex } = parseHexAddress(hexAddress);

    let tag = noBounceableTag;
    if (bounceable) {
        tag = BounceableTag;
    }

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

/**
 * Validates if the address is in user-friendly format by attempting to parse it.
 * @param address address to validate
 * @returns true if the address is valid user-friendly format, false otherwise
 */
export function isValidUserFriendlyAddress(address: string): boolean {
    try {
        parseUserFriendlyAddress(address);
        return true;
    } catch {
        return false;
    }
}

/**
 * Validates if the address is in raw hex format (e.g., "0:1234..." or "-1:1234...").
 * @param address address to validate
 * @returns true if the address is valid raw format, false otherwise
 */
export function isValidRawAddress(address: string): boolean {
    try {
        parseHexAddress(address);
        return true;
    } catch {
        return false;
    }
}

/**
 * Parses user-friendly address and returns its components.
 * @param address user-friendly address
 * @returns parsed address components
 */
export function parseUserFriendlyAddress(address: string): {
    wc: 0 | -1;
    hex: string;
    testOnly: boolean;
    isBounceable: boolean;
} {
    const base64 = address.replace(/-/g, '+').replace(/_/g, '/');

    let decoded: Uint8Array;
    try {
        decoded = Base64.decode(base64).toUint8Array();
    } catch {
        throw new WrongAddressError(`Invalid base64 encoding in address: ${address}`);
    }

    if (decoded.length !== 36) {
        throw new WrongAddressError(`Invalid address length: ${address}`);
    }

    const addr = decoded.slice(0, 34);
    const checksum = decoded.slice(34);

    const calculatedChecksum = crc16(addr);
    if (!checksum.every((byte, i) => byte === calculatedChecksum[i])) {
        throw new WrongAddressError(`Invalid checksum in address: ${address}`);
    }

    const tag = addr[0]!;
    const wc = addr[1] as 0 | -1;
    const hex = addr.slice(2);

    if (wc !== 0 && wc !== -1) {
        throw new WrongAddressError(`Invalid workchain: ${wc}`);
    }

    const testOnly = (tag & testOnlyTag) !== 0;
    const isBounceable = (tag & 0x40) !== 0;

    return {
        wc,
        hex: Array.from(hex)
            .map(b => b.toString(16).padStart(2, '0'))
            .join(''),
        testOnly,
        isBounceable
    };
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
