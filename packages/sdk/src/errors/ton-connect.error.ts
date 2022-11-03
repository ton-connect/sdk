export class TonConnectError extends Error {
    constructor(...args: ConstructorParameters<typeof Error>) {
        super(...args);

        Object.setPrototypeOf(this, TonConnectError.prototype);
    }
}
