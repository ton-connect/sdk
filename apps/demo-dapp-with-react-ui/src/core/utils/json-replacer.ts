import { Address, Cell } from '@ton/core';
import { Buffer } from 'buffer';

/** JSON.stringify replacer for TON types (BigInt, Address, Cell, Buffer). */
export function jsonReplacer(_key: string, value: unknown): unknown {
    if (typeof value === 'bigint') {
        return value.toString();
    }

    if (value instanceof Address) {
        return value.toString();
    }

    if (value instanceof Cell) {
        return value.toBoc().toString('base64');
    }

    if (value instanceof Buffer) {
        return value.toString('base64');
    }

    if (
        value &&
        typeof value === 'object' &&
        'type' in value &&
        (value as { type: unknown }).type === 'Buffer' &&
        'data' in value &&
        Array.isArray((value as { data: unknown }).data)
    ) {
        return Buffer.from((value as { data: number[] }).data).toString('base64');
    }

    return value;
}

export function stringifyForDisplay(value: unknown): string {
    return JSON.stringify(value, jsonReplacer, 2);
}
