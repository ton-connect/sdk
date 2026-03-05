import { RawBaseIntentPayload } from './base-intent-payload';

export interface RawSendActionIntentRequest extends RawBaseIntentPayload {
    /**
     * Must be set to `actionIntent`.
     */
    m: 'actionIntent';

    /**
     * Action URL that the wallet should call.
     * The wallet should call with `address={user_address}` query parameter.
     */
    a: string;
}
