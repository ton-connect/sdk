import { determineWalletVersion, loadWalletTransfer } from '../../contracts/wallet';
import { Address, beginCell, Cell, loadMessage, storeStateInit } from '@ton/ton';
import { CHAIN } from '@tonconnect/sdk';
import type { EvalContext } from './context';

export function isValidSendTransactionId(this: EvalContext, value: unknown): boolean {
    if (!this?.sendTransactionRpcRequest) {
        console.error('Invalid context to isValidSendTransactionId provided');
        return false;
    }

    return value === this.sendTransactionRpcRequest.id;
}

export function isValidSignDataId(this: EvalContext, value: unknown): boolean {
    if (!this?.signDataRpcRequest) {
        console.error('Invalid context to isValidSignDataId provided');
        return false;
    }

    return value === this.signDataRpcRequest.id;
}

// eslint-disable-next-line complexity
export function isValidSendTransactionBoc(this: EvalContext, value: unknown): boolean {
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

export function isValidString(value: unknown) {
    return typeof value === 'string';
}

export function isNonNegativeInt(value: unknown) {
    return Number.isInteger(value) && (value as number) >= 0;
}
