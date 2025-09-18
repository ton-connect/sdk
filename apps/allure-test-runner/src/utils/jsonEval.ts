import {
    isNonNegativeInt,
    isValidCurrentTimestamp,
    isValidDataSignature,
    isValidFeatureList,
    isValidNetwork,
    isValidPublicKey,
    isValidRawAddressString,
    isValidSendTransactionBoc,
    isValidSendTransactionId,
    isValidSignDataId,
    isValidStateInitString,
    isValidString,
    isValidTonProofSignature
} from './jsonEval/predicates';
import {
    appHost,
    appHostLength,
    mainnet,
    maxMessages,
    mintJettonWithDeployMessage,
    mintJettonWithoutDeployMessage,
    nowMinus5Minutes,
    nowPlus5Minutes,
    nowPlusMinutes,
    sender,
    testnet,
    tonProofPayload,
    updateMerkleProofMessage,
    verifyMerkleProofMessage
} from './jsonEval/providers';
import type { EvalContext } from './jsonEval/context';

const functionScope = {
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
    tonProofPayload,
    appHost,
    appHostLength,

    // should be left as it is, e.g. isValidSendTransactionBoc without parentheses
    isValidSendTransactionBoc,
    isValidString,
    isNonNegativeInt,
    isValidSendTransactionId,
    isValidSignDataId,
    isValidRawAddressString,
    isValidCurrentTimestamp,
    isValidDataSignature,
    isValidNetwork,
    isValidStateInitString,
    isValidPublicKey,
    isValidFeatureList,
    isValidTonProofSignature
};

function extractFromCodeFence(input: string): string | null {
    const fence = /```json\s*\n([\s\S]*?)\n```/i.exec(input);
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
        return new Function(...Object.keys(functionScope), `"use strict";return (${fromFence});`)(
            ...Object.values(functionScope).map(fn => fn.bind(context))
        );
    } catch (error) {
        console.error(error);
        return undefined;
    }
}
