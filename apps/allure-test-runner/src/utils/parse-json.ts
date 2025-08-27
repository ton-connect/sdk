function extractFromCodeFence(input: string): string | null {
    const fence = /```(?:json)?\n([\s\S]*?)\n```/i.exec(input);
    if (fence && fence[1]) return fence[1].trim();
    return null;
}

function nowPlusMinutes(minutes: number): number {
    return Math.floor(Date.now() / 1000) + minutes * 60;
}

function nowPlus5Minutes() {
    return Math.floor(Date.now() / 1000).toString();
}

function nowMinus5Minutes() {}

const functionScope = [nowPlusMinutes, nowPlus5Minutes, nowMinus5Minutes];

export function evalFenceCondition(input: string | undefined | null): unknown | null {
    if (!input) return null;
    const fromFence = extractFromCodeFence(input);
    if (!fromFence) return null;
    try {
        return new Function(
            ...functionScope.map(fn => fn.name),
            `"use strict";return (${fromFence});`
        )(...functionScope);
    } catch {
        return null;
    }
}
