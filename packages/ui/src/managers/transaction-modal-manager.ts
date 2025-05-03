import { ITonConnect } from '@tonconnect/sdk';
import { createEffect } from 'solid-js';
import { action, Action } from 'src/app/state/modals-state';

interface TransactionModalManagerCreateOptions {
    /**
     * TonConnect instance.
     */
    connector: ITonConnect;
}

/**
 * Manages the transaction modal window state.
 */
export class TransactionModalManager {
    /**
     * TonConnect instance.
     * @internal
     */
    private readonly connector: ITonConnect;

    /**
     * List of subscribers to the modal window state changes.
     * @internal
     */
    private consumers: Array<(action: Action | null) => void> = [];

    constructor(options: TransactionModalManagerCreateOptions) {
        this.connector = options.connector;

        createEffect(() => {
            const currentAction = action();
            this.consumers.forEach(consumer => consumer(currentAction));
        });
    }

    /**
     * Subscribe to the modal window state changes, returns unsubscribe function.
     */
    public onStateChange(consumer: (action: Action | null) => void): () => void {
        this.consumers.push(consumer);

        return () => {
            this.consumers = this.consumers.filter(c => c !== consumer);
        };
    }
}
