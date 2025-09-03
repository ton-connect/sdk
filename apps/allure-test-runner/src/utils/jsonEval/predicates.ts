import { determineWalletVersion, loadWalletTransfer } from '../../contracts/wallet';
import { Address, beginCell, Cell, loadMessage, storeStateInit } from '@ton/ton';
import { CHAIN } from '@tonconnect/sdk';
import type { EvalContext } from './context';

export type PredicateResult = {
    isValid: boolean;
    errors?: string[];
};

export function isValidSendTransactionId(this: EvalContext, value: unknown): PredicateResult {
    if (!this?.sendTransactionRpcRequest) {
        return {
            isValid: false,
            errors: ['Invalid context to isValidSendTransactionId provided']
        };
    }

    if (value !== this.sendTransactionRpcRequest.id) {
        return {
            isValid: false,
            errors: [
                `expected id "${this.sendTransactionRpcRequest.id}", got "${JSON.stringify(value)}"`
            ]
        };
    }

    return { isValid: true };
}

export function isValidSignDataId(this: EvalContext, value: unknown): PredicateResult {
    if (!this?.signDataRpcRequest) {
        return {
            isValid: false,
            errors: ['Invalid context to isValidSignDataId provided']
        };
    }

    if (value !== this.signDataRpcRequest.id) {
        return {
            isValid: false,
            errors: [`expected id "${this.signDataRpcRequest.id}", got "${JSON.stringify(value)}"`]
        };
    }

    return { isValid: true };
}

// eslint-disable-next-line complexity
export function isValidSendTransactionBoc(this: EvalContext, value: unknown): PredicateResult {
    const errors: string[] = [];

    if (!this?.sendTransactionParams) {
        errors.push('Invalid context to isValidSendTransactionId provided');
        return { isValid: false, errors };
    }

    const stateInit = this.wallet?.account?.walletStateInit;
    const walletVersion = determineWalletVersion(stateInit);
    if (!walletVersion) {
        errors.push('Unsupported wallet version');
        return { isValid: false, errors };
    }

    const {
        sendTransactionParams: { validUntil, messages, network }
    } = this;

    if (typeof value !== 'string') {
        errors.push(`expected base64 string BOC, got "${JSON.stringify(value)}"`);
        return { isValid: false, errors };
    }

    try {
        const message = loadMessage(Cell.fromBase64(value).beginParse());
        const walletTransfer = loadWalletTransfer(message.body, walletVersion);

        if (message.info.type !== 'external-in') {
            errors.push('expected external-in message');
        }

        const walletV5Id =
            (network ?? this.wallet?.account?.chain) === CHAIN.TESTNET ? 2147483645 : 2147483409;
        const expectedWalletId = ['v5r1', 'v5beta'].includes(walletVersion)
            ? walletV5Id
            : 698983191;

        if (walletTransfer.walletId !== expectedWalletId) {
            errors.push(
                `invalid wallet id: expected ${expectedWalletId}, got ${walletTransfer.walletId}`
            );
        }

        if (validUntil && validUntil !== walletTransfer.validUntil) {
            errors.push(
                `invalid validUntil: expected ${validUntil}, got ${walletTransfer.validUntil}`
            );
        }

        if (walletTransfer.messages.length !== messages.length) {
            errors.push(
                `invalid messages length: expected ${messages.length}, got ${walletTransfer.messages.length}`
            );
        }

        for (let i = 0; i < messages.length; i++) {
            const messageRelaxed = walletTransfer.messages[i];
            const userMessage = messages[i];

            if (messageRelaxed?.info?.type !== 'internal') {
                errors.push(`messages[${i}]: expected internal message`);
                continue;
            }

            if (!Address.parse(userMessage.address).equals(messageRelaxed.info.dest)) {
                errors.push(
                    `messages[${i}]: invalid address, expected ${userMessage.address}, got ${messageRelaxed.info.dest}`
                );
            }

            if (Address.isFriendly(userMessage.address)) {
                const { isBounceable } = Address.parseFriendly(userMessage.address);
                if (isBounceable !== messageRelaxed.info.bounce) {
                    errors.push(`messages[${i}]: invalid bounce flag`);
                }
            }

            if (
                userMessage.payload &&
                !Cell.fromBase64(userMessage.payload).equals(messageRelaxed.body)
            ) {
                errors.push(`messages[${i}]: invalid payload`);
            }

            if (userMessage.amount !== messageRelaxed.info.value.coins.toString()) {
                errors.push(
                    `messages[${i}]: invalid amount: expected ${userMessage.amount}, got ${messageRelaxed.info.value.coins.toString()}`
                );
            }

            if (
                userMessage.stateInit &&
                !Cell.fromBase64(userMessage.stateInit).equals(
                    beginCell().store(storeStateInit(messageRelaxed.init!)).endCell()
                )
            ) {
                errors.push(`messages[${i}]: invalid state init`);
            }

            // TODO? extraCurrency check
            // if (userMessage.extraCurrency && messageRelaxed.info.value.other)
        }

        return { isValid: errors.length === 0, errors: errors.length ? errors : undefined };
    } catch (err) {
        errors.push(`failed to parse/validate BOC: ${String(err)}`);
        return { isValid: false, errors };
    }
}

export function isValidString(value: unknown): PredicateResult {
    if (typeof value === 'string') {
        return { isValid: true };
    }
    return { isValid: false, errors: [`expected string, got ${typeof value}`] };
}

export function isNonNegativeInt(value: unknown): PredicateResult {
    if (Number.isInteger(value) && (value as number) >= 0) {
        return { isValid: true };
    }
    return {
        isValid: false,
        errors: [`expected non-negative integer, got ${JSON.stringify(value)}`]
    };
}
