import type { SendTransactionRpcRequest } from '@tonconnect/protocol';
import type { SendTransactionRequest } from '@tonconnect/sdk';
import { Cell, loadMessage } from '@ton/core';

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
        sendTransactionRpcRequest?: SendTransactionRpcRequest;
    }
): boolean {
    if (!context?.sendTransactionRpcRequest) {
        console.error('Invalid context to isValidSendTransactionId provided');
        return false;
    }

    return value === context.sendTransactionRpcRequest.id;
}

function isValidSendTransactionBoc(
    value: unknown,
    context?: {
        sendTransactionParams?: SendTransactionRequest;
    }
): boolean {
    if (!context?.sendTransactionParams) {
        console.error('Invalid context to isValidSendTransactionId provided');
        return false;
    }
    // const {
    //     sendTransactionParams: { validUntil, network, messages }
    // } = context;
    if (typeof value !== 'string') {
        return false;
    }
    try {
        const message = loadMessage(Cell.fromBase64(value).beginParse());
        // const bodyParsed = message.body.beginParse();
        // v5 message formats
        // try {
        //     const ref = bodyParsed.loadRef();
        //     const outList = loadOutList(ref.beginParse());
        //     if (outList.length !== messages.length) {
        //         return false;
        //     }
        //
        //     for (let i = 0; i < outList.length; i++) {
        //         const out = outList[i];
        //         if (out.type !== 'sendMsg') {
        //             return false;
        //         }
        //
        //         const { outMsg } = out;
        //
        //         const sentOutMsg = messages[i];
        //         if (outMsg.info.type !== '') out.address;
        //     }
        // } catch (error) {
        //     // v4 format
        // }
        if (message.info.type !== 'external-in') {
            return false;
        }
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
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
    isValidSendTransactionBoc,
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
