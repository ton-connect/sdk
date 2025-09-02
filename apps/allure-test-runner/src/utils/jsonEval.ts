import type { SendTransactionRpcRequest, SignDataRpcRequest } from '@tonconnect/protocol';
import { CHAIN, type SendTransactionRequest, type Wallet } from '@tonconnect/sdk';
import { Address, beginCell, Cell, loadMessage, storeStateInit, toNano } from '@ton/ton';
import {
    buildSuccessMerkleProof,
    buildSuccessMerkleUpdate,
    buildVerifyMerkleProof,
    buildVerifyMerkleUpdate,
    Exotic,
    EXOTIC_CODE
} from '../contracts/exotic';
import { determineWalletVersion, loadWalletTransfer } from '../contracts/wallet';

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

// eslint-disable-next-line complexity
function isValidSendTransactionBoc(
    this: {
        wallet?: Wallet;
        sendTransactionParams?: SendTransactionRequest;
    },
    value: unknown
): boolean {
    // TODO: somehow make errors appear on ui
    if (!this?.sendTransactionParams) {
        console.error('Invalid context to isValidSendTransactionId provided');
        return false;
    }

    const stateInit = this.wallet?.account?.walletStateInit;
    const walletVersion = determineWalletVersion(stateInit);
    if (!walletVersion) {
        console.error('Unsupported wallet version');
        return false;
    }

    const {
        sendTransactionParams: { validUntil, messages, network }
    } = this;
    if (typeof value !== 'string') {
        return false;
    }
    try {
        const message = loadMessage(Cell.fromBase64(value).beginParse());
        const walletTransfer = loadWalletTransfer(message.body, walletVersion);

        if (message.info.type !== 'external-in') {
            return false;
        }

        let walletV5Id =
            (network ?? this.wallet?.account?.chain) === CHAIN.TESTNET ? 2147483645 : 2147483409;
        let expectedWalletId = ['v5r1', 'v5beta'].includes(walletVersion) ? walletV5Id : 698983191;

        if (walletTransfer.walletId !== expectedWalletId) {
            console.error(
                `Invalid wallet id, expected ${expectedWalletId}, got ${walletTransfer.walletId}`
            );
            return false;
        }

        if (validUntil && validUntil !== walletTransfer.validUntil) {
            console.error('Invalid validUntil');
            return false;
        }

        if (walletTransfer.messages.length !== messages.length) {
            console.error(
                `Invalid messages length, expected ${messages.length}, got ${walletTransfer.messages.length}`
            );
            return false;
        }

        for (let i = 0; i < messages.length; i++) {
            const messageRelaxed = walletTransfer.messages[i];
            if (messageRelaxed.info.type !== 'internal') {
                return false;
            }
            const userMessage = messages[i];

            if (!Address.parse(userMessage.address).equals(messageRelaxed.info.dest)) {
                console.error('Invalid address');
                return false;
            }

            if (Address.isFriendly(userMessage.address)) {
                const { isBounceable } = Address.parseFriendly(userMessage.address);
                if (isBounceable !== messageRelaxed.info.bounce) {
                    console.error('Invalid bounce flag');
                    return false;
                }
            }

            if (
                userMessage.payload &&
                !Cell.fromBase64(userMessage.payload).equals(messageRelaxed.body)
            ) {
                console.error('Invalid payload');
                return false;
            }

            if (userMessage.amount !== messageRelaxed.info.value.coins.toString()) {
                console.error('Invalid amount');
                return false;
            }

            if (
                userMessage.stateInit &&
                !Cell.fromBase64(userMessage.stateInit).equals(
                    beginCell().store(storeStateInit(messageRelaxed.init!)).endCell()
                )
            ) {
                console.error('Invalid state init');
                return false;
            }

            // TODO? extraCurrency check
            // if (userMessage.extraCurrency && messageRelaxed.info.value.other)
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
    return CHAIN.MAINNET;
}

function testnet() {
    return CHAIN.TESTNET;
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
