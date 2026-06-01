import { CreateJettonRequest } from '../../../server/dto/create-jetton-request-dto';

const POSITIVE_AMOUNT_PATTERN = /^\d+$/;

/**
 * Semantic validation for create-jetton metadata JSON.
 */
export function validateCreateJettonRequest(value: unknown): string[] {
    const issues: string[] = [];

    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        issues.push('Request must be a JSON object');
        return issues;
    }

    const result = CreateJettonRequest.safeParse(value);
    if (!result.success) {
        for (const issue of result.error.issues) {
            const path = issue.path.length > 0 ? issue.path.join('.') : 'root';
            issues.push(`${path}: ${issue.message}`);
        }
    }

    const record = value as Record<string, unknown>;
    const amount = record.amount;

    if (typeof amount === 'string' && amount.length > 0) {
        if (!POSITIVE_AMOUNT_PATTERN.test(amount)) {
            issues.push(
                'amount: must be a positive integer string in nanotons (no sign or decimals)'
            );
        } else if (BigInt(amount) === 0n) {
            issues.push('amount: must be greater than zero');
        }
    }

    if (
        typeof record.decimals === 'number' &&
        (!Number.isInteger(record.decimals) || record.decimals < 0)
    ) {
        issues.push('decimals: must be a non-negative integer');
    }

    return issues;
}
