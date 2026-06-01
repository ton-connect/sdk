import { Address } from '@ton/ton';

const BOC_PREFIX = 'te6cc';
const BASE64_REGEX = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
const BASE64URL_REGEX = /^[A-Za-z0-9\-_]+$/;
const NETWORK_PATTERN = /^-?\d+$/;

function isValidBoc(value: string): boolean {
    return (
        (BASE64_REGEX.test(value) || BASE64URL_REGEX.test(value)) && value.startsWith(BOC_PREFIX)
    );
}

function isValidTonAddress(value: string): boolean {
    try {
        Address.parse(value);
        return true;
    } catch {
        return false;
    }
}

function validateOptionalFrom(value: unknown, issues: string[]): void {
    if (value === undefined) {
        return;
    }

    if (typeof value !== 'string' || value.trim().length === 0) {
        issues.push('from: required when present');
        return;
    }

    if (!isValidTonAddress(value)) {
        issues.push('from: invalid TON address format');
    }
}

function validateOptionalNetwork(value: unknown, issues: string[]): void {
    if (value === undefined) {
        return;
    }

    if (typeof value !== 'string' || !NETWORK_PATTERN.test(value)) {
        issues.push('network: must be a chain id string (e.g. "-239")');
    }
}

/**
 * Semantic validation for sign-data JSON payloads (text / binary / cell).
 */
export function validateSignDataPayload(value: unknown): string[] {
    const issues: string[] = [];

    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        issues.push('Payload must be a JSON object');
        return issues;
    }

    const payload = value as Record<string, unknown>;

    if (typeof payload.type !== 'string') {
        issues.push('type: required');
        return issues;
    }

    validateOptionalNetwork(payload.network, issues);
    validateOptionalFrom(payload.from, issues);

    switch (payload.type) {
        case 'text': {
            if (typeof payload.text !== 'string' || payload.text.length === 0) {
                issues.push('text: required');
            }
            break;
        }
        case 'binary': {
            if (typeof payload.bytes !== 'string' || payload.bytes.length === 0) {
                issues.push('bytes: required');
            }
            break;
        }
        case 'cell': {
            if (typeof payload.schema !== 'string' || payload.schema.length === 0) {
                issues.push('schema: required');
            }
            if (typeof payload.cell !== 'string' || payload.cell.length === 0) {
                issues.push('cell: required');
            } else if (!isValidBoc(payload.cell)) {
                issues.push('cell: must be a valid base64 BoC (starts with te6cc)');
            }
            break;
        }
        default:
            issues.push('type: must be "text", "binary", or "cell"');
    }

    return issues;
}
