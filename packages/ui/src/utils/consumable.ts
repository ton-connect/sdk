export class Consumable<T> {
    private _value: T | undefined;

    constructor(value: T) {
        this._value = value;
    }

    consume(): T | undefined {
        console.trace('Consuming object', this._value);
        const value = this._value;
        this._value = undefined;
        return value;
    }

    get consumed(): boolean {
        return this._value === null;
    }
}
