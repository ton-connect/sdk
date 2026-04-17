import { logDebug } from './log';

export type OptionalConsumable<T> = T | Consumable<T>;

export class Consumable<T> {
    private _value: T | undefined;

    static fromOptional<T>(value: OptionalConsumable<T>): Consumable<T> {
        if (value instanceof Consumable) {
            return value;
        }

        return new Consumable(value);
    }

    constructor(value: T) {
        this._value = value;
    }

    peek(): T | undefined {
        return this._value;
    }

    consume(): T | undefined {
        logDebug('Consuming object', this._value);
        const value = this._value;
        this._value = undefined;
        return value;
    }

    get consumed(): boolean {
        return this._value === undefined;
    }
}
