import { determineWalletVersion, loadWalletTransfer } from '../../contracts/wallet';
import { Address, beginCell, Cell, loadMessage, storeStateInit } from '@ton/ton';
import { CHAIN } from '@tonconnect/ui-react';
import type { EvalContext } from './context';
import { sha256_sync, signVerify } from '@ton/crypto';
import { bstr as crc32 } from 'crc-32';
import { loadStateInit } from '@ton/core';
import { Buffer } from 'buffer';
import { encodeDomainDnsLike } from './utils';

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

export function isValidRawAddressString(value: unknown): PredicateResult {
    if (typeof value !== 'string') {
        return {
            isValid: false,
            errors: [`expected string, got ${typeof value}`]
        };
    }

    if (!Address.isRaw(value)) {
        return { isValid: false, errors: ['address in not in raw format'] };
    }

    return {
        isValid: true
    };
}

export function isValidCurrentTimestamp(value: unknown): PredicateResult {
    if (typeof value !== 'number') {
        return {
            isValid: false,
            errors: [`expected number, got ${typeof value}`]
        };
    }

    const now = Math.floor(Date.now() / 1000);
    const oneDayInSeconds = 24 * 60 * 60;

    if (value < now - oneDayInSeconds || value > now + oneDayInSeconds) {
        return {
            isValid: false,
            errors: ['timestamp is not within ±1 day of current time']
        };
    }

    return {
        isValid: true
    };
}

// SHOULD NOT BE USED FOR PRODUCTION VERIFICATION
export function isValidDataSignature(this: EvalContext, value: unknown): PredicateResult {
    if (!this?.signDataResponse || !this?.wallet?.account?.publicKey) {
        return {
            isValid: false,
            errors: ['invalid context provided']
        };
    }

    if (typeof value !== 'string') {
        return {
            isValid: false,
            errors: [`expected string, got ${typeof value}`]
        };
    }

    const publicKey = Buffer.from(this.wallet.account.publicKey, 'hex');
    let signatureBuffer: Buffer;
    try {
        signatureBuffer = Buffer.from(value, 'base64');
    } catch {
        return {
            isValid: false,
            errors: ['invalid Base64 encoding']
        };
    }

    const { address: addressRaw, payload, timestamp, domain } = this.signDataResponse;
    const address = Address.parse(addressRaw);
    try {
        let isValid: boolean;
        if (payload.type === 'cell') {
            const encodedDomain = encodeDomainDnsLike(domain);

            let signatureCell = beginCell()
                .storeUint(0x75569022, 32)
                .storeUint(crc32(payload.schema), 32)
                .storeUint(timestamp, 64)
                .storeAddress(address)
                .storeStringRefTail(encodedDomain.toString('utf8'))
                .storeRef(Cell.fromBase64(payload.cell))
                .endCell();

            isValid = signVerify(signatureCell.hash(), signatureBuffer, publicKey);
        } else {
            const prefix = Buffer.from([0xff, 0xff]);
            const header = Buffer.from('ton-connect/sign-data/', 'utf8');

            const workchainBuffer = Buffer.alloc(4);
            workchainBuffer.writeInt32BE(address.workChain);

            const hashBuffer = address.hash; // 32 bytes Buffer

            const appDomainBytes = Buffer.from(domain, 'utf8');
            const appDomainLength = Buffer.alloc(4);
            appDomainLength.writeUInt32BE(appDomainBytes.length);

            const appDomainEncoded = Buffer.concat([appDomainLength, appDomainBytes]);

            const timestampBuffer = Buffer.alloc(8);
            timestampBuffer.writeBigUInt64BE(BigInt(timestamp));

            const payloadData =
                payload.type === 'text'
                    ? Buffer.from(payload.text, 'utf8')
                    : Buffer.from(payload.bytes, 'base64');
            const payloadTypePrefix = Buffer.from(payload.type === 'text' ? 'txt' : 'bin', 'utf8');

            const payloadLength = Buffer.alloc(4);
            payloadLength.writeUInt32BE(payloadData.length);

            const payloadFull = Buffer.concat([payloadTypePrefix, payloadLength, payloadData]);

            const message = Buffer.concat([
                prefix,
                header,
                workchainBuffer,
                hashBuffer,
                appDomainEncoded,
                timestampBuffer,
                payloadFull
            ]);

            const messageHash = sha256_sync(message);

            isValid = signVerify(messageHash, signatureBuffer, publicKey);
        }

        return isValid
            ? { isValid: true }
            : { isValid: false, errors: [`invalid ${payload.type} signature`] };
    } catch (err) {
        return {
            isValid: false,
            errors: [`cannot construct signature ${String(err)}`]
        };
    }
}

export function isValidNetwork(value: unknown): PredicateResult {
    if (value !== CHAIN.TESTNET && value !== CHAIN.MAINNET) {
        return {
            isValid: false,
            errors: [
                `invalid network: expected ${CHAIN.MAINNET} or ${CHAIN.TESTNET}, got ${JSON.stringify(value)}`
            ]
        };
    }

    return {
        isValid: true
    };
}

export function isValidStateInitString(value: unknown): PredicateResult {
    if (typeof value !== 'string') {
        return { isValid: false };
    }

    try {
        const stateInitCell = Cell.fromBase64(value);
        loadStateInit(stateInitCell.beginParse());
        return { isValid: true };
    } catch (err) {
        return {
            isValid: false,
            errors: [`Cannot parse state init ${JSON.stringify(value)}`]
        };
    }
}

export function isValidPublicKey(value: unknown): PredicateResult {
    if (typeof value !== 'string') {
        return { isValid: false };
    }

    try {
        const buffer = Buffer.from(value, 'hex');
        if (buffer.length !== 32) {
            return {
                isValid: false,
                errors: [`invalid public key length: got "${buffer.length}" expected 32`]
            };
        }
        return { isValid: true };
    } catch {
        return { isValid: false, errors: ['public key not in hex format'] };
    }
}

export function isValidFeatureList(value: unknown): PredicateResult {
    if (!Array.isArray(value)) {
        return { isValid: false, errors: ['expected an array of features'] };
    }

    const errors: string[] = [];

    for (let i = 0; i < value.length; i++) {
        const feature = value[i];

        if (typeof feature === 'string') {
            if (feature !== 'SendTransaction') {
                errors.push(`feature at index ${i} is an invalid string literal: ${feature}`);
            }
            continue;
        }

        if (typeof feature !== 'object' || feature === null) {
            errors.push(`feature at index ${i} is not a valid object`);
            continue;
        }

        const name = feature.name;

        if (name === 'SendTransaction') {
            if (typeof feature.maxMessages !== 'number') {
                errors.push(`feature at index ${i} must have a numeric 'maxMessages'`);
            }

            if (
                'extraCurrencySupported' in feature &&
                typeof feature.extraCurrencySupported !== 'boolean'
            ) {
                errors.push(
                    `feature at index ${i} has invalid 'extraCurrencySupported' (must be boolean)`
                );
            }
        } else if (name === 'SignData') {
            const types = feature.types;
            if (!Array.isArray(types)) {
                errors.push(`feature at index ${i} must have a 'types' array`);
            } else {
                const validTypes = ['text', 'binary', 'cell'];
                for (const t of types) {
                    if (!validTypes.includes(t)) {
                        errors.push(
                            `feature at index ${i} has invalid type '${t}' in 'types' array`
                        );
                    }
                }
            }
        } else {
            errors.push(`feature at index ${i} has unsupported name: ${name}`);
        }
    }

    return errors.length > 0 ? { isValid: false, errors } : { isValid: true };
}

// SHOULD NOT BE USED FOR PRODUCTION VERIFICATION
export function isValidTonProofSignature(this: EvalContext, value: unknown): PredicateResult {
    if (this?.connectResponse?.event !== 'connect') {
        return {
            isValid: false,
            errors: ['invalid context to isValidTonProofSignature provided']
        };
    }
    if (typeof value !== 'string') {
        return { isValid: false, errors: [`invalid type: expected string, got ${typeof value}`] };
    }

    const tonProof = this.connectResponse.payload.items.find(item => item.name === 'ton_proof');
    if (!tonProof) {
        return { isValid: false, errors: ['cannot find ton_proof'] };
    }
    const tonAddr = this.connectResponse.payload.items.find(item => item.name === 'ton_addr');
    if (!tonAddr) {
        return { isValid: false, errors: ['cannot find ton_addr'] };
    }
    if ('error' in tonProof) {
        return { isValid: false, errors: [tonProof.error.message ?? ''] };
    }

    const {
        proof: { payload, domain, timestamp }
    } = tonProof;

    const address = Address.parse(tonAddr.address);
    const wc = Buffer.alloc(4);
    wc.writeUInt32BE(address.workChain, 0);

    const ts = Buffer.alloc(8);
    ts.writeBigUInt64LE(BigInt(timestamp), 0);

    const dl = Buffer.alloc(4);
    dl.writeUInt32LE(domain.lengthBytes, 0);

    const msg = Buffer.concat([
        Buffer.from('ton-proof-item-v2/'),
        wc,
        address.hash,
        dl,
        Buffer.from(domain.value),
        ts,
        Buffer.from(payload)
    ]);

    const msgHash = Buffer.from(sha256_sync(msg));

    const fullMsg = Buffer.concat([Buffer.from([0xff, 0xff]), Buffer.from('ton-connect'), msgHash]);

    const result = Buffer.from(sha256_sync(fullMsg));

    try {
        const isValid = signVerify(
            result,
            Buffer.from(value, 'base64'),
            Buffer.from(tonAddr.publicKey, 'hex')
        );

        if (!isValid) {
            return { isValid, errors: ['signature invalid'] };
        }

        return { isValid };
    } catch (err) {
        return { isValid: false, errors: [String(err)] };
    }
}
