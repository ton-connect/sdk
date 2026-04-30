import { isValidUserFriendlyAddress, isValidRawAddress } from 'src/utils/address';
import { getDomain } from 'src/utils/web-api';

const BASE64_REGEX = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
const BASE64URL_REGEX = /^[A-Za-z0-9\-_]+$/;

const BOC_PREFIX = 'te6cc';
const INTEGER_REGEX = /^-?\d+$/;
const POSITIVE_INTEGER_REGEX = /^\d+$/;

const MAX_DOMAIN_BYTES = 128;
const MAX_PAYLOAD_BYTES = 128;
const MAX_TOTAL_BYTES = 222;

type ValidationResult = string | null;

function isValidNumber(value: unknown): value is number {
    return typeof value === 'number' && !isNaN(value);
}

function isValidString(value: unknown): value is string {
    return typeof value === 'string' && value.length > 0;
}

function isValidAddress(value: unknown): boolean {
    return isValidString(value) && (isValidRawAddress(value) || isValidUserFriendlyAddress(value));
}

function isValidNetwork(value: unknown): boolean {
    return isValidString(value) && /^-?\d+$/.test(value);
}

function isValidBoc(value: unknown): value is string {
    return (
        typeof value === 'string' &&
        (BASE64_REGEX.test(value) || BASE64URL_REGEX.test(value)) &&
        value.startsWith(BOC_PREFIX)
    );
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

export function validateSignMessageRequest(data: unknown): ValidationResult {
    return validateSendTransactionRequest(data);
}

export function validateSendTransactionRequest(data: unknown): ValidationResult {
    if (!isValidObject(data)) {
        return 'Request must be an object';
    }

    const allowedKeys = ['validUntil', 'network', 'from', 'messages', 'items'];
    if (hasExtraProperties(data, allowedKeys)) {
        return 'Request contains extra properties';
    }

    if (data.validUntil) {
        if (!isValidNumber(data.validUntil)) {
            return "Incorrect 'validUntil'";
        }

        const now = Math.floor(Date.now() / 1000);
        const fiveMinutesFromNow = now + 300;
        if (data.validUntil > fiveMinutesFromNow) {
            console.warn(
                `validUntil (${data.validUntil}) is more than 5 minutes from now (${now})`
            );
        }
    }

    if (data.network !== undefined) {
        if (!isValidNetwork(data.network)) {
            return "Invalid 'network' format";
        }
    }

    if (data.from !== undefined && !isValidAddress(data.from)) {
        return "Invalid 'from' address format";
    }

    const hasMessagesField = isValidArray(data.messages);
    const hasItemsField = isValidArray(data.items);

    if (hasMessagesField && hasItemsField) {
        return "Request must contain either 'messages' or 'items', not both";
    }

    if (!hasMessagesField && !hasItemsField) {
        return "Request must contain 'messages' or 'items'";
    }

    if (hasMessagesField) {
        if ((data.messages as unknown[]).length === 0) {
            return "'messages' must not be empty";
        }

        for (let i = 0; i < (data.messages as unknown[]).length; i++) {
            const message = (data.messages as unknown[])[i];
            const messageError = validateTransactionMessage(message, i);
            if (messageError) {
                return messageError;
            }
        }
    }

    if (hasItemsField) {
        const error = validateStructuredItems(data.items as unknown[]);
        if (error) {
            return error;
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

function validateStructuredItems(items: unknown[]): ValidationResult {
    if (items.length === 0) {
        return "'items' must not be empty";
    }

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemError = validateStructuredItem(item, i);
        if (itemError) {
            return itemError;
        }
    }

    return null;
}

function validateStructuredItem(item: unknown, index: number): ValidationResult {
    if (!isValidObject(item)) {
        return `Item at index ${index} must be an object`;
    }

    if (!isValidString(item.type)) {
        return `'type' is required in item at index ${index}`;
    }

    switch (item.type) {
        case 'ton':
            return validateTonItem(item, index);
        case 'jetton':
            return validateJettonItem(item, index);
        case 'nft':
            return validateNftItem(item, index);
        default:
            return `Unknown item type '${item.type}' at index ${index}`;
    }
}

function validateTonItem(item: Record<string, unknown>, index: number): ValidationResult {
    const allowedKeys = ['type', 'address', 'amount', 'payload', 'stateInit', 'extraCurrency'];
    if (hasExtraProperties(item, allowedKeys)) {
        return `Ton item at index ${index} contains extra properties`;
    }

    if (!isValidString(item.address)) {
        return `'address' is required in ton item at index ${index}`;
    }
    if (!isValidUserFriendlyAddress(item.address)) {
        return `Wrong 'address' format in ton item at index ${index}`;
    }

    if (!isValidString(item.amount)) {
        return `'amount' is required in ton item at index ${index}`;
    }
    if (!/^[0-9]+$/.test(item.amount)) {
        return `Incorrect 'amount' in ton item at index ${index}`;
    }

    if (item.payload !== undefined) {
        if (!isValidString(item.payload) || !isValidBoc(item.payload)) {
            return `Invalid 'payload' in ton item at index ${index}`;
        }
    }

    if (item.stateInit !== undefined) {
        if (!isValidString(item.stateInit) || !isValidBoc(item.stateInit)) {
            return `Invalid 'stateInit' in ton item at index ${index}`;
        }
    }

    if (item.extraCurrency !== undefined) {
        if (!isValidObject(item.extraCurrency)) {
            return `Invalid 'extraCurrency' in ton item at index ${index}`;
        }
        for (const [key, value] of Object.entries(item.extraCurrency)) {
            if (
                !INTEGER_REGEX.test(key) ||
                typeof value !== 'string' ||
                !POSITIVE_INTEGER_REGEX.test(value)
            ) {
                return `Invalid 'extraCurrency' format in ton item at index ${index}`;
            }
        }
    }

    return null;
}

// eslint-disable-next-line complexity
function validateJettonItem(item: Record<string, unknown>, index: number): ValidationResult {
    const allowedKeys = [
        'type',
        'master',
        'destination',
        'amount',
        'attachAmount',
        'responseDestination',
        'customPayload',
        'forwardAmount',
        'forwardPayload',
        'queryId'
    ];
    if (hasExtraProperties(item, allowedKeys)) {
        return `Jetton item at index ${index} contains extra properties`;
    }

    if (!isValidString(item.master)) {
        return `'master' is required in jetton item at index ${index}`;
    }
    if (!isValidAddress(item.master)) {
        return `Wrong 'master' address format in jetton item at index ${index}`;
    }

    if (!isValidString(item.destination)) {
        return `'destination' is required in jetton item at index ${index}`;
    }
    if (!isValidAddress(item.destination)) {
        return `Wrong 'destination' address format in jetton item at index ${index}`;
    }

    if (!isValidString(item.amount)) {
        return `'amount' is required in jetton item at index ${index}`;
    }
    if (!/^[0-9]+$/.test(item.amount)) {
        return `Incorrect 'amount' in jetton item at index ${index}`;
    }

    if (
        item.attachAmount !== undefined &&
        (!isValidString(item.attachAmount) || !/^[0-9]+$/.test(item.attachAmount))
    ) {
        return `Invalid 'attachAmount' in jetton item at index ${index}`;
    }

    if (item.responseDestination !== undefined && !isValidAddress(item.responseDestination)) {
        return `Wrong 'responseDestination' address format in jetton item at index ${index}`;
    }

    if (item.customPayload !== undefined) {
        if (!isValidString(item.customPayload) || !isValidBoc(item.customPayload)) {
            return `Invalid 'customPayload' in jetton item at index ${index}`;
        }
    }

    if (item.forwardAmount !== undefined) {
        if (!isValidString(item.forwardAmount) || !/^[0-9]+$/.test(item.forwardAmount)) {
            return `Invalid 'forwardAmount' in jetton item at index ${index}`;
        }
    }

    if (item.forwardPayload !== undefined) {
        if (!isValidString(item.forwardPayload) || !isValidBoc(item.forwardPayload)) {
            return `Invalid 'forwardPayload' in jetton item at index ${index}`;
        }
    }

    if (item.queryId !== undefined) {
        if (!isValidString(item.queryId) || !/^[0-9]+$/.test(item.queryId)) {
            return `Invalid 'queryId' in jetton item at index ${index}`;
        }
    }

    return null;
}

// eslint-disable-next-line complexity
function validateNftItem(item: Record<string, unknown>, index: number): ValidationResult {
    const allowedKeys = [
        'type',
        'nftAddress',
        'newOwner',
        'attachAmount',
        'responseDestination',
        'customPayload',
        'forwardAmount',
        'forwardPayload',
        'queryId'
    ];
    if (hasExtraProperties(item, allowedKeys)) {
        return `NFT item at index ${index} contains extra properties`;
    }

    if (!isValidString(item.nftAddress)) {
        return `'nftAddress' is required in nft item at index ${index}`;
    }
    if (!isValidAddress(item.nftAddress)) {
        return `Wrong 'nftAddress' address format in nft item at index ${index}`;
    }

    if (!isValidString(item.newOwner)) {
        return `'newOwner' is required in nft item at index ${index}`;
    }
    if (!isValidAddress(item.newOwner)) {
        return `Wrong 'newOwner' address format in nft item at index ${index}`;
    }

    if (item.attachAmount !== undefined) {
        if (!isValidString(item.attachAmount) || !/^[0-9]+$/.test(item.attachAmount)) {
            return `Invalid 'attachAmount' in nft item at index ${index}`;
        }
    }

    if (item.responseDestination !== undefined && !isValidAddress(item.responseDestination)) {
        return `Wrong 'responseDestination' address format in nft item at index ${index}`;
    }

    if (item.customPayload !== undefined) {
        if (!isValidString(item.customPayload) || !isValidBoc(item.customPayload)) {
            return `Invalid 'customPayload' in nft item at index ${index}`;
        }
    }

    if (item.forwardAmount !== undefined) {
        if (!isValidString(item.forwardAmount) || !/^[0-9]+$/.test(item.forwardAmount)) {
            return `Invalid 'forwardAmount' in nft item at index ${index}`;
        }
    }

    if (item.forwardPayload !== undefined) {
        if (!isValidString(item.forwardPayload) || !isValidBoc(item.forwardPayload)) {
            return `Invalid 'forwardPayload' in nft item at index ${index}`;
        }
    }

    if (item.queryId !== undefined) {
        if (!isValidString(item.queryId) || !/^[0-9]+$/.test(item.queryId)) {
            return `Invalid 'queryId' in nft item at index ${index}`;
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

    if (data.tonProof !== undefined) {
        if (typeof data.tonProof !== 'string') {
            return "Invalid 'tonProof'";
        }

        const payload = data.tonProof;
        if (payload.length === 0) {
            return "Empty 'tonProof' payload";
        }

        // Get current domain for validation first
        const domain = getDomain();
        if (!domain) {
            // In Node.js environment, skip domain validation
            return null;
        }

        // Validate domain size (max 128 bytes)
        const domainBytes = new TextEncoder().encode(domain).length;
        if (domainBytes > MAX_DOMAIN_BYTES) {
            return 'Current domain exceeds 128 bytes limit';
        }

        // Validate payload size (max 128 bytes)
        const payloadBytes = new TextEncoder().encode(payload).length;
        if (payloadBytes > MAX_PAYLOAD_BYTES) {
            return "'tonProof' payload exceeds 128 bytes limit";
        }

        // Validate total size (domain + payload <= 222 bytes)
        if (domainBytes + payloadBytes > MAX_TOTAL_BYTES) {
            return "'tonProof' domain + payload exceeds 222 bytes limit";
        }
    }

    return null;
}

export function validateEmbeddedRequest(data: unknown) {
    if (!isValidObject(data)) {
        return 'Embedded request must be an object';
    }

    if (hasExtraProperties(data, ['method', 'request'])) {
        return 'Embedded request contains extra properties';
    }

    if (!isValidString(data.method)) {
        return "Embedded request: 'method' is required";
    }

    if (!('request' in data)) {
        return "Embedded request: 'request' is required";
    }

    const prefixError = (inner: ValidationResult): ValidationResult =>
        inner === null ? null : `Embedded ${data.method}: ${inner}`;

    switch (data.method) {
        case 'sendTransaction':
            return prefixError(validateSendTransactionRequest(data.request));
        case 'signData':
            return prefixError(validateSignDataPayload(data.request));
        case 'signMessage':
            return prefixError(validateSignMessageRequest(data.request));
    }

    return `Invalid 'method' value: ${data.method}`;
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
        if (!isValidNetwork(data.network)) {
            return "Invalid 'network' format";
        }
    }

    if (data.from !== undefined && !isValidAddress(data.from)) {
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
        if (!isValidNetwork(data.network)) {
            return "Invalid 'network' format";
        }
    }

    if (data.from !== undefined && !isValidAddress(data.from)) {
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
        if (!isValidNetwork(data.network)) {
            return "Invalid 'network' format";
        }
    }

    if (data.from !== undefined && !isValidAddress(data.from)) {
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

    const allowedKeys = ['error', 'proof', 'name'];
    if (hasExtraProperties(data, allowedKeys)) {
        return 'ton_proof item contains extra properties';
    }

    const hasProof = Object.prototype.hasOwnProperty.call(data, 'proof');
    const hasError = Object.prototype.hasOwnProperty.call(data, 'error');

    if (!hasProof && !hasError) {
        return "'ton_proof' item must contain either 'proof' or 'error'";
    }

    if (hasProof && hasError) {
        return "'ton_proof' item must contain either 'proof' or 'error', not both";
    }

    if (hasProof) {
        const proof = (data as Record<string, unknown>).proof as
            | Record<string, unknown>
            | undefined;
        if (!isValidObject(proof)) {
            return "Invalid 'proof' object";
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
