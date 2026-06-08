import { logDebug } from './log';

/**
 * Accept either a bare value or a value already wrapped in a {@link Consumable}.
 */
export type ConsumableLike<T> = T | Consumable<T>;

/**
 * Single-shot value envelope. Holds a value until exactly one consumer calls
 * {@link Consumable.consume}; subsequent reads return `undefined`.
 */
export class Consumable<T> {
    private value: T | undefined;

    private readonly __isConsumable = true;

    /**
     * Wrap `value`. If `value` is already a `Consumable`, returns it
     * unchanged so the type stays flat.
     */
    constructor(value: ConsumableLike<T>) {
        if (value && typeof value === 'object' && (value as Consumable<T>).__isConsumable) {
            return value as Consumable<T>;
        }

        this.value = value as T;
    }

    /** Read the wrapped value without consuming it. `undefined` once consumed. */
    peek(): T | undefined {
        return this.value;
    }

    /**
     * Take ownership of the wrapped value. The next call returns `undefined`.
     * Use this when the value is about to be acted on exactly once.
     */
    consume(): T | undefined {
        logDebug('Consuming object', this.value);
        const value = this.value;
        this.value = undefined;
        return value;
    }

    /** `true` once {@link Consumable.consume} has been called. */
    get consumed(): boolean {
        return this.value === undefined;
    }
}
