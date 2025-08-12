import { isValidUserFriendlyAddress, isValidRawAddress } from 'src/utils/address';

const BASE64_REGEX = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
const BOC_PREFIX = 'te6cc';
const INTEGER_REGEX = /^-?\d+$/;
const POSITIVE_INTEGER_REGEX = /^\d+$/;

type ValidationResult = string | null;

function isValidNumber(value: unknown): value is number {
    return typeof value === 'number' && !isNaN(value);
}

function isValidString(value: unknown): value is string {
    return typeof value === 'string' && value.length > 0;
}

function isValidBoc(value: unknown): value is string {
    return typeof value === 'string' && BASE64_REGEX.test(value) && value.startsWith(BOC_PREFIX);
}

function isValidObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidArray(value: unknown): value is unknown[] {
    return Array.isArray(value);
}

function hasExtraProperties(obj: Record<string, unknown>, allowedKeys: string[]): boolean {
    return Object.keys(obj).some(key => !allowedKeys.includes(key));
}

export function validateSendTransactionRequest(data: unknown): ValidationResult {
    if (!isValidObject(data)) {
        return 'Request must be an object';
    }

    const allowedKeys = ['validUntil', 'network', 'from', 'messages'];
    if (hasExtraProperties(data, allowedKeys)) {
        return 'Request contains extra properties';
    }

    if (!isValidNumber(data.validUntil)) {
        return "Incorrect 'validUntil'";
    }

    const now = Math.floor(Date.now() / 1000);
    const fiveMinutesFromNow = now + 300;
    if (data.validUntil > fiveMinutesFromNow) {
        console.warn(`validUntil (${data.validUntil}) is more than 5 minutes from now (${now})`);
    }

    if (data.network !== undefined) {
        if (!isValidString(data.network) || !/^[\d-]+$/.test(data.network)) {
            return "Invalid 'network' format";
        }
    }

    if (data.from !== undefined) {
        if (!isValidString(data.from) || !isValidRawAddress(data.from)) {
            return "Invalid 'from' address format";
        }
    }

    if (!isValidArray(data.messages) || data.messages.length === 0) {
        return "'messages' is required";
    }

    for (let i = 0; i < data.messages.length; i++) {
        const message = data.messages[i];
        const messageError = validateTransactionMessage(message, i);
        if (messageError) {
            return messageError;
        }
    }

    return null;
}

function validateTransactionMessage(message: unknown, index: number): ValidationResult {
    if (!isValidObject(message)) {
        return `Message at index ${index} must be an object`;
    }

    const allowedKeys = ['address', 'amount', 'stateInit', 'payload', 'extraCurrency'];
    if (hasExtraProperties(message, allowedKeys)) {
        return `Message at index ${index} contains extra properties`;
    }

    if (!isValidString(message.address)) {
        return `'address' is required in message at index ${index}`;
    }
    if (!isValidUserFriendlyAddress(message.address)) {
        return `Wrong 'address' format in message at index ${index}`;
    }

    if (!isValidString(message.amount)) {
        return `'amount' is required in message at index ${index}`;
    }
    if (!/^[0-9]+$/.test(message.amount)) {
        return `Incorrect 'amount' in message at index ${index}`;
    }

    if (message.stateInit !== undefined) {
        if (!isValidString(message.stateInit) || !isValidBoc(message.stateInit)) {
            return `Invalid 'stateInit' in message at index ${index}`;
        }
    }

    if (message.payload !== undefined) {
        if (!isValidString(message.payload) || !isValidBoc(message.payload)) {
            return `Invalid 'payload' in message at index ${index}`;
        }
    }

    if (message.extraCurrency !== undefined) {
        if (!isValidObject(message.extraCurrency)) {
            return `Invalid 'extraCurrency' in message at index ${index}`;
        }
        for (const [key, value] of Object.entries(message.extraCurrency)) {
            if (
                !INTEGER_REGEX.test(key) ||
                typeof value !== 'string' ||
                !POSITIVE_INTEGER_REGEX.test(value)
            ) {
                return `Invalid 'extraCurrency' format in message at index ${index}`;
            }
        }
    }

    return null;
}

export function validateConnectAdditionalRequest(data: unknown): ValidationResult {
    if (!isValidObject(data)) {
        return 'Request must be an object';
    }

    const allowedKeys = ['tonProof'];
    if (hasExtraProperties(data, allowedKeys)) {
        return 'Request contains extra properties';
    }

    if (data.tonProof !== undefined && !isValidString(data.tonProof)) {
        return "Invalid 'tonProof'";
    }

    return null;
}

export function validateSignDataPayload(data: unknown): ValidationResult {
    if (!isValidObject(data)) {
        return 'Payload must be an object';
    }

    if (!isValidString(data.type)) {
        return "'type' is required";
    }

    switch (data.type) {
        case 'text':
            return validateSignDataPayloadText(data);
        case 'binary':
            return validateSignDataPayloadBinary(data);
        case 'cell':
            return validateSignDataPayloadCell(data);
        default:
            return "Invalid 'type' value";
    }
}

function validateSignDataPayloadText(data: Record<string, unknown>): ValidationResult {
    const allowedKeys = ['type', 'text', 'network', 'from'];
    if (hasExtraProperties(data, allowedKeys)) {
        return 'Text payload contains extra properties';
    }

    if (!isValidString(data.text)) {
        return "'text' is required";
    }

    if (data.network !== undefined) {
        if (!isValidString(data.network) || !/^\d+$/.test(data.network)) {
            return "Invalid 'network' format";
        }
    }

    if (data.from !== undefined && !isValidString(data.from)) {
        return "Invalid 'from'";
    }

    return null;
}

function validateSignDataPayloadBinary(data: Record<string, unknown>): ValidationResult {
    const allowedKeys = ['type', 'bytes', 'network', 'from'];
    if (hasExtraProperties(data, allowedKeys)) {
        return 'Binary payload contains extra properties';
    }

    if (!isValidString(data.bytes)) {
        return "'bytes' is required";
    }

    if (data.network !== undefined) {
        if (!isValidString(data.network) || !/^\d+$/.test(data.network)) {
            return "Invalid 'network' format";
        }
    }

    if (data.from !== undefined && !isValidString(data.from)) {
        return "Invalid 'from'";
    }

    return null;
}

function validateSignDataPayloadCell(data: Record<string, unknown>): ValidationResult {
    const allowedKeys = ['type', 'schema', 'cell', 'network', 'from'];
    if (hasExtraProperties(data, allowedKeys)) {
        return 'Cell payload contains extra properties';
    }

    if (!isValidString(data.schema)) {
        return "'schema' is required";
    }

    if (!isValidString(data.cell)) {
        return "'cell' is required";
    }

    if (!isValidBoc(data.cell)) {
        return "Invalid 'cell' format (must be valid base64)";
    }

    if (data.network !== undefined) {
        if (!isValidString(data.network) || !/^\d+$/.test(data.network)) {
            return "Invalid 'network' format";
        }
    }

    if (data.from !== undefined && !isValidString(data.from)) {
        return "Invalid 'from'";
    }

    return null;
}

/**
 * Validates ton_proof item received from wallet in connect event.
 */
// eslint-disable-next-line complexity
export function validateTonProofItemReply(data: unknown): ValidationResult {
    if (!isValidObject(data)) {
        return 'ton_proof item must be an object';
    }

    const allowedKeys = ['error', 'proof'];
    if (hasExtraProperties(data, allowedKeys)) {
        return 'ton_proof item contains extra properties';
    }

    const hasProof = Object.prototype.hasOwnProperty.call(data, 'proof');
    const hasError = Object.prototype.hasOwnProperty.call(data, 'error');

    if (!hasProof && !hasError) {
        return "'ton_proof' item must contain either 'proof' or 'error'";
    }

    if (hasProof) {
        const proof = (data as Record<string, unknown>).proof as
            | Record<string, unknown>
            | undefined;
        if (!isValidObject(proof)) {
            return "Invalid 'proof' object";
        }

        const allowedProofKeys = ['timestamp', 'domain', 'payload', 'signature'];
        if (hasExtraProperties(proof, allowedProofKeys)) {
            return 'ton_proof item contains extra properties';
        }

        if (!isValidNumber(proof.timestamp)) {
            return "Invalid 'proof.timestamp'";
        }

        const domain = proof.domain as Record<string, unknown> | undefined;
        if (!isValidObject(domain)) {
            return "Invalid 'proof.domain'";
        }
        if (!isValidNumber(domain.lengthBytes)) {
            return "Invalid 'proof.domain.lengthBytes'";
        }
        if (!isValidString(domain.value)) {
            return "Invalid 'proof.domain.value'";
        }
        // Try to verify that provided byte length matches actual byte length of value
        try {
            const encoderAvailable = typeof TextEncoder !== 'undefined';
            const actualLength = encoderAvailable
                ? new TextEncoder().encode(domain.value).length
                : (domain.value as string).length;
            if (actualLength !== (domain.lengthBytes as number)) {
                return "'proof.domain.lengthBytes' does not match 'proof.domain.value'";
            }
        } catch {
            // Ignore environment issues; best-effort validation
        }

        if (!isValidString(proof.payload)) {
            return "Invalid 'proof.payload'";
        }

        if (!isValidString(proof.signature) || !BASE64_REGEX.test(proof.signature)) {
            return "Invalid 'proof.signature' format";
        }
    }

    if (hasError) {
        const error = (data as Record<string, unknown>).error as
            | Record<string, unknown>
            | undefined;
        if (!isValidObject(error)) {
            return "Invalid 'error' object";
        }

        const allowedErrorKeys = ['code', 'message'];
        if (hasExtraProperties(error, allowedErrorKeys)) {
            return 'ton_proof error contains extra properties';
        }

        if (!isValidNumber(error.code)) {
            return "Invalid 'error.code'";
        }
        if (!isValidString(error.message)) {
            return "Invalid 'error.message'";
        }
    }

    return null;
}
