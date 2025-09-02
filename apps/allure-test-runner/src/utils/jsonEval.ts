import type { SendTransactionRpcRequest, SignDataRpcRequest } from '@tonconnect/protocol';
import { type SendTransactionRequest } from '@tonconnect/sdk';
import { Address, beginCell, Cell, loadMessage, storeStateInit, toNano } from '@ton/core';
import {
    buildSuccessMerkleProof,
    buildSuccessMerkleUpdate,
    buildVerifyMerkleProof,
    buildVerifyMerkleUpdate,
    Exotic,
    EXOTIC_CODE
} from '../contracts/exotic';

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
    this: {
        sendTransactionRpcRequest?: SendTransactionRpcRequest;
    } | null,
    value: unknown
): boolean {
    if (!this?.sendTransactionRpcRequest) {
        console.error('Invalid context to isValidSendTransactionId provided');
        return false;
    }

    return value === this.sendTransactionRpcRequest.id;
}

function isValidSignDataId(
    this: {
        signDataRpcRequest?: SignDataRpcRequest;
    } | null,
    value: unknown
): boolean {
    if (!this?.signDataRpcRequest) {
        console.error('Invalid context to isValidSignDataId provided');
        return false;
    }

    return value === this.signDataRpcRequest.id;
}

function isValidSendTransactionBoc(
    this: {
        sendTransactionParams?: SendTransactionRequest;
    },
    value: unknown
): boolean {
    if (!this?.sendTransactionParams) {
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

function verifyMerkleProofMessage(this: { sender?: string } | null) {
    if (!this?.sender) {
        console.error('Invalid context for exoticMessagesResolver provided');
        return undefined;
    }

    const { sender } = this;

    const exotic = Exotic.createFromConfig(
        {
            owner: Address.parse(sender)
        },
        EXOTIC_CODE
    );

    const exoticAddress = exotic.address.toString({
        urlSafe: true,
        bounceable: true
    });

    const stateInit = beginCell().store(storeStateInit(exotic.init!)).endCell();

    return {
        address: exoticAddress,
        amount: toNano('0.06').toString(),
        stateInit: stateInit.toBoc().toString('base64'),
        payload: buildVerifyMerkleProof(buildSuccessMerkleProof()).toBoc().toString('base64')
    };
}

function sender(this: { sender?: string } | null, format: 'raw' | 'bounceable' | 'non-bounceable') {
    if (!this?.sender) {
        console.error('Invalid context for senderResolver provided');
        return undefined;
    }
    const sender = Address.parse(this.sender);

    switch (format) {
        case 'raw':
            return sender.toRawString();
        case 'bounceable':
            return sender.toString({ bounceable: true });
        case 'non-bounceable':
            return sender.toString({ bounceable: false });
        default:
            console.error('Invalid format for senderResolver provided');
            return undefined;
    }
}

function updateMerkleProofMessage(this: { sender?: string } | null) {
    if (!this?.sender) {
        console.error('Invalid context for updateMerkleProofMessageResolver provided');
        return undefined;
    }

    const { sender } = this;

    const exotic = Exotic.createFromConfig(
        {
            owner: Address.parse(sender)
        },
        EXOTIC_CODE
    );

    const exoticAddress = exotic.address.toString({
        bounceable: true
    });

    const stateInit = beginCell().store(storeStateInit(exotic.init!)).endCell();

    return {
        address: exoticAddress,
        amount: toNano('0.06').toString(),
        stateInit: stateInit.toBoc().toString('base64'),
        payload: buildVerifyMerkleUpdate(buildSuccessMerkleUpdate()).toBoc().toString('base64')
    };
}

function mainnet() {
    return '-239';
}

function testnet() {
    return '-3';
}

const functionScope = [
    nowPlusMinutes,
    nowPlus5Minutes,
    nowMinus5Minutes,
    mainnet,
    testnet,

    sender,

    verifyMerkleProofMessage,
    updateMerkleProofMessage,

    isValidSendTransactionBoc,
    isValidString,
    isNonNegativeInt,
    isValidSendTransactionId,
    isValidSignDataId
];

export function evalFenceCondition<T = unknown>(
    input: string | undefined | null,
    context: unknown = null
): T | undefined {
    if (!input) {
        console.warn('No input');
        return undefined;
    }
    const fromFence = extractFromCodeFence(input);
    if (!fromFence) {
        console.warn(`No code from fence ${input}`);
        return undefined;
    }
    try {
        return new Function(
            ...functionScope.map(fn => fn.name),
            `"use strict";return (${fromFence});`
        )(...functionScope.map(fn => fn.bind(context)));
    } catch (error) {
        console.error(error);
        return undefined;
    }
}
