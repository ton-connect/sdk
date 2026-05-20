export function formatPresetSupply(amount: string, decimals: number): string {
    const nano = BigInt(amount);
    const base = 10n ** BigInt(decimals);
    const whole = nano / base;
    const remainder = nano % base;

    if (remainder === 0n) {
        return whole.toLocaleString('en-US');
    }

    const fraction = remainder
        .toString()
        .padStart(decimals, '0')
        .replace(/0+$/, '');

    return `${whole.toLocaleString('en-US')}.${fraction}`;
}
