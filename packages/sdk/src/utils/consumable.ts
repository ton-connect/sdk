import { logDebug } from './log';

export type ConsumableLike<T> = T | Consumable<T>;

export class Consumable<T> {
    private value: T | undefined;

    static fromConsumableLike<T>(value: ConsumableLike<T>): Consumable<T> {
        if (value instanceof Consumable) {
            return value;
        }

        return new Consumable(value);
    }

    constructor(value: T) {
        this.value = value;
    }

    peek(): T | undefined {
        return this.value;
    }

    consume(): T | undefined {
        logDebug('Consuming object', this.value);
        const value = this.value;
        this.value = undefined;
        return value;
    }

    get consumed(): boolean {
        return this.value === undefined;
    }
}
