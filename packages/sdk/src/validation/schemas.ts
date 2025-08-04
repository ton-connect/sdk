import { isValidUserFriendlyAddress, isValidRawAddress } from 'src/utils/address';

const BASE64_REGEX = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
const BOC_PREFIX = 'te6cc';

type ValidationResult = string | null;

function isValidNumber(value: any): boolean {
    return typeof value === 'number' && !isNaN(value);
}

function isValidString(value: any): boolean {
    return typeof value === 'string' && value.length > 0;
}

function isValidBoc(value: any): boolean {
    return typeof value === 'string' && BASE64_REGEX.test(value) && value.startsWith(BOC_PREFIX);
}

function isValidObject(value: any): boolean {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidArray(value: any): boolean {
    return Array.isArray(value);
}

function hasExtraProperties(obj: any, allowedKeys: string[]): boolean {
    return Object.keys(obj).some(key => !allowedKeys.includes(key));
}

export function validateSendTransactionRequest(data: any): ValidationResult {
    if (!isValidObject(data)) {
        return "Request must be an object";
    }

    const allowedKeys = ['validUntil', 'network', 'from', 'messages'];
    if (hasExtraProperties(data, allowedKeys)) {
        return "Request contains extra properties";
    }

    if (!isValidNumber(data.validUntil)) {
        return "Incorrect 'validUntil'";
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

function validateTransactionMessage(message: any, index: number): ValidationResult {
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
            if (!isValidNumber(Number(key)) || !isValidString(value)) {
                return `Invalid 'extraCurrency' format in message at index ${index}`;
            }
        }
    }

    return null;
}

export function validateConnectAdditionalRequest(data: any): ValidationResult {
    if (!isValidObject(data)) {
        return "Request must be an object";
    }

    const allowedKeys = ['tonProof'];
    if (hasExtraProperties(data, allowedKeys)) {
        return "Request contains extra properties";
    }

    if (data.tonProof !== undefined && !isValidString(data.tonProof)) {
        return "Invalid 'tonProof'";
    }

    return null;
}

export function validateSignDataPayload(data: any): ValidationResult {
    if (!isValidObject(data)) {
        return "Payload must be an object";
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

function validateSignDataPayloadText(data: any): ValidationResult {
    const allowedKeys = ['type', 'text', 'network', 'from'];
    if (hasExtraProperties(data, allowedKeys)) {
        return "Text payload contains extra properties";
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

function validateSignDataPayloadBinary(data: any): ValidationResult {
    const allowedKeys = ['type', 'bytes', 'network', 'from'];
    if (hasExtraProperties(data, allowedKeys)) {
        return "Binary payload contains extra properties";
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

function validateSignDataPayloadCell(data: any): ValidationResult {
    const allowedKeys = ['type', 'schema', 'cell', 'network', 'from'];
    if (hasExtraProperties(data, allowedKeys)) {
        return "Cell payload contains extra properties";
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
