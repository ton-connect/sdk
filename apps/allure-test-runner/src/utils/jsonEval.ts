import type { SendTransactionRpcRequest } from '@tonconnect/protocol';

function extractFromCodeFence(input: string): string | null {
    const fence = /```(?:json)?\n([\s\S]*?)\n```/i.exec(input);
    if (fence && fence[1]) return fence[1].trim();
    return null;
}

function nowPlusMinutes(minutes: number): number {
    return Math.floor(Date.now() / 1000) + minutes * 60;
}

function nowPlus5Minutes() {
    return nowPlusMinutes(5);
}

function nowMinus5Minutes() {
    return nowPlusMinutes(-5);
}

function isValidSendTransactionId(
    value: unknown,
    context?: {
        sendTransactionRpcRequest: SendTransactionRpcRequest;
    }
): boolean {
    if (!context?.sendTransactionRpcRequest) {
        console.error('Invalid context to isValidSendTransactionId provided');
        return false;
    }

    return value === context.sendTransactionRpcRequest.id;
}

function isValidBoc(value: unknown): boolean {
    // TODO:
    value;
    return true;
}

function isValidString(value: unknown) {
    return typeof value === 'string';
}

function isNonNegativeInt(value: unknown) {
    return Number.isInteger(value) && (value as number) >= 0;
}

const functionScope = [
    nowPlusMinutes,
    nowPlus5Minutes,
    nowMinus5Minutes,
    isValidBoc,
    isValidString,
    isNonNegativeInt,
    isValidSendTransactionId
];

export function evalFenceCondition<T = unknown>(input: string | undefined | null): T | undefined {
    if (!input) return undefined;
    const fromFence = extractFromCodeFence(input);
    if (!fromFence) return undefined;
    try {
        return new Function(
            ...functionScope.map(fn => fn.name),
            `"use strict";return (${fromFence});`
        )(...functionScope);
    } catch (error) {
        console.error(error);
        return undefined;
    }
}
