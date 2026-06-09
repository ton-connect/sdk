import { Address } from '@ton/ton';

import { jsonPath } from './json-path';
import {
    TRANSACTION_VALID_UNTIL_MAX_HOURS,
    TRANSACTION_VALID_UNTIL_MAX_SECONDS
} from './valid-until-limits';
import type { JsonValidationResult } from './validation-result';

const POSITIVE_AMOUNT_PATTERN = /^\d+$/;

function validateValidUntil(
    value: unknown,
    errors: string[],
    warnings: string[],
    nowSec: number
): void {
    const field = jsonPath('validUntil');

    if (value === undefined) {
        errors.push(`${field}: required`);
        return;
    }

    if (typeof value !== 'number' || !Number.isFinite(value) || !Number.isInteger(value)) {
        errors.push(`${field}: must be a unix timestamp in seconds (integer number)`);
        return;
    }

    if (value <= nowSec) {
        errors.push(`${field}: must be in the future (deadline has already expired)`);
        return;
    }

    const maxAllowed = nowSec + TRANSACTION_VALID_UNTIL_MAX_SECONDS;
    if (value > maxAllowed) {
        warnings.push(
            `${field}: more than ${TRANSACTION_VALID_UNTIL_MAX_HOURS} hours from now — unusually long for transactions`
        );
    }
}

function isValidTonAddress(value: string): boolean {
    try {
        Address.parse(value);
        return true;
    } catch {
        return false;
    }
}

function validatePositiveNanoAmount(amount: unknown, field: string, issues: string[]): void {
    if (typeof amount !== 'string' || amount.length === 0) {
        issues.push(`${field}: amount is required`);
        return;
    }

    if (!POSITIVE_AMOUNT_PATTERN.test(amount)) {
        issues.push(
            `${field}: amount must be a positive integer string in nanograms (no sign or decimals)`
        );
        return;
    }

    if (BigInt(amount) === 0n) {
        issues.push(`${field}: amount must be greater than zero`);
    }
}

function validateTonAddressField(
    value: unknown,
    field: string,
    issues: string[],
    property = 'address'
): void {
    if (typeof value !== 'string' || value.trim().length === 0) {
        issues.push(`${field}.${property}: required`);
        return;
    }

    if (!isValidTonAddress(value)) {
        issues.push(`${field}.${property}: invalid TON address format`);
    }
}

function validateMessage(message: unknown, index: number, issues: string[]): void {
    const field = jsonPath('messages', index);

    if (!message || typeof message !== 'object' || Array.isArray(message)) {
        issues.push(`${field}: must be an object`);
        return;
    }

    const msg = message as Record<string, unknown>;
    validateTonAddressField(msg.address, field, issues, 'address');
    validatePositiveNanoAmount(msg.amount, field, issues);
}

function validateTonItem(item: Record<string, unknown>, index: number, issues: string[]): void {
    const field = jsonPath('items', index);
    validateTonAddressField(item.address, field, issues, 'address');
    validatePositiveNanoAmount(item.amount, field, issues);
}

function validateJettonItem(item: Record<string, unknown>, index: number, issues: string[]): void {
    const field = jsonPath('items', index);
    validateTonAddressField(item.master, field, issues, 'master');
    validateTonAddressField(item.destination, field, issues, 'destination');
    validatePositiveNanoAmount(item.amount, field, issues);

    if (item.attachAmount !== undefined) {
        validatePositiveNanoAmount(item.attachAmount, `${field}.attachAmount`, issues);
    }
}

function validateNftItem(item: Record<string, unknown>, index: number, issues: string[]): void {
    const field = jsonPath('items', index);
    validateTonAddressField(item.nftAddress, field, issues, 'nftAddress');
    validateTonAddressField(item.newOwner, field, issues, 'newOwner');
}

function validateItem(item: unknown, index: number, issues: string[]): void {
    const field = jsonPath('items', index);

    if (!item || typeof item !== 'object' || Array.isArray(item)) {
        issues.push(`${field}: must be an object`);
        return;
    }

    const record = item as Record<string, unknown>;
    const type = record.type;

    if (type === 'ton') {
        validateTonItem(record, index, issues);
        return;
    }

    if (type === 'jetton') {
        validateJettonItem(record, index, issues);
        return;
    }

    if (type === 'nft') {
        validateNftItem(record, index, issues);
        return;
    }

    issues.push(`${field}.type: unknown or missing (expected "ton", "jetton", or "nft")`);
}

/**
 * Semantic validation for send/sign transaction JSON (beyond JSON syntax).
 * `errors` block submit; `warnings` are advisory only.
 */
export function validateTransactionRequest(
    value: unknown,
    nowSec: number = Math.floor(Date.now() / 1000)
): JsonValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        errors.push('Request must be a JSON object');
        return { errors, warnings };
    }

    const request = value as Record<string, unknown>;
    validateValidUntil(request.validUntil, errors, warnings, nowSec);

    const hasMessages = Array.isArray(request.messages);
    const hasItems = Array.isArray(request.items);

    if (hasMessages && hasItems) {
        errors.push("Request must contain either 'messages' or 'items', not both");
        return { errors, warnings };
    }

    if (!hasMessages && !hasItems) {
        errors.push("Request must contain a non-empty 'messages' or 'items' array");
        return { errors, warnings };
    }

    if (hasMessages) {
        const messages = request.messages as unknown[];
        if (messages.length === 0) {
            errors.push('messages: must contain at least one entry');
        } else {
            messages.forEach((message, index) => validateMessage(message, index, errors));
        }
    }

    if (hasItems) {
        const items = request.items as unknown[];
        if (items.length === 0) {
            errors.push('items: must contain at least one entry');
        } else {
            items.forEach((item, index) => validateItem(item, index, errors));
        }
    }

    return { errors, warnings };
}
