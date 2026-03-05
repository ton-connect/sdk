import { RawBaseIntentPayload } from './base-intent-payload';

export interface RawSendActionIntentRequest extends RawBaseIntentPayload {
    /**
     * Must be set to `actionIntent`.
     */
    m: 'actionIntent';

    /**
     * Explicit sender address for the intent.
     * Shortened field name: `f` (maps to `from` in high-level SDK types).
     */
    f?: string;

    /**
     * Action URL that the wallet should call.
     * The wallet should call with `address={user_address}` query parameter.
     */
    a: string;
}
