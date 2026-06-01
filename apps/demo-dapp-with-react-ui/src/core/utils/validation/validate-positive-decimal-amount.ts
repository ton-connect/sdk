export interface PositiveDecimalAmountOptions {
    /** Maximum digits after the decimal point (e.g. 6 for USDT). */
    maxDecimals?: number;
}

/**
 * Validates a human-entered token amount (e.g. "0.01", "100").
 * Returns an error message or `null` when valid.
 */
export function validatePositiveDecimalAmount(
    value: string,
    options: PositiveDecimalAmountOptions = {}
): string | null {
    const { maxDecimals } = options;
    const trimmed = value.trim();

    if (!trimmed) {
        return 'Amount is required';
    }

    if (!/^\d+(\.\d+)?$/.test(trimmed)) {
        return 'Enter a positive number';
    }

    const numeric = Number(trimmed);
    if (!Number.isFinite(numeric) || numeric <= 0) {
        return 'Amount must be greater than zero';
    }

    const fraction = trimmed.split('.')[1];
    if (maxDecimals !== undefined && fraction !== undefined && fraction.length > maxDecimals) {
        return `Use at most ${maxDecimals} decimal places`;
    }

    return null;
}

/** Keeps only digits and a single decimal separator, optionally capped at `maxDecimals`. */
export function sanitizeDecimalAmountInput(value: string, maxDecimals?: number): string {
    let next = value.replace(/[^\d.]/g, '');

    const dotIndex = next.indexOf('.');
    if (dotIndex !== -1) {
        const intPart = next.slice(0, dotIndex);
        let fracPart = next.slice(dotIndex + 1).replace(/\./g, '');
        if (maxDecimals !== undefined) {
            fracPart = fracPart.slice(0, maxDecimals);
        }
        next = `${intPart}.${fracPart}`;
    }

    return next;
}
