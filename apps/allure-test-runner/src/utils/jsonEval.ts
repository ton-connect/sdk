import {
    isNonNegativeInt,
    isValidSendTransactionBoc,
    isValidSendTransactionId,
    isValidSignDataId,
    isValidString
} from './jsonEval/predicates';
import {
    mainnet,
    maxMessages,
    mintJettonWithDeployMessage,
    mintJettonWithoutDeployMessage,
    nowMinus5Minutes,
    nowPlus5Minutes,
    nowPlusMinutes,
    sender,
    testnet,
    updateMerkleProofMessage,
    verifyMerkleProofMessage
} from './jsonEval/providers';
import type { EvalContext } from './jsonEval/context';

const functionScope = [
    // should be called with (...args), e.g. updateMerkleProofMessage() or sender('raw')
    nowPlusMinutes,
    nowPlus5Minutes,
    nowMinus5Minutes,
    mainnet,
    testnet,
    sender,
    verifyMerkleProofMessage,
    updateMerkleProofMessage,
    mintJettonWithDeployMessage,
    mintJettonWithoutDeployMessage,
    maxMessages,

    // should be left as it is, e.g. isValidSendTransactionBoc without parentheses
    isValidSendTransactionBoc,
    isValidString,
    isNonNegativeInt,
    isValidSendTransactionId,
    isValidSignDataId
];

function extractFromCodeFence(input: string): string | null {
    const fence = /```(?:json)?\n([\s\S]*?)\n```/i.exec(input);
    if (fence && fence[1]) return fence[1].trim();
    return null;
}

export function evalFenceCondition<T = unknown>(
    input: string | undefined | null,
    context: EvalContext = null
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
