import { BaseIntentPayload } from './base-intent-payload';

export interface SendActionIntentRequest extends BaseIntentPayload {
    /**
     * Must be set to `actionIntent`.
     */
    m: 'actionIntent';

    /**
     * Action URL to be handled by the wallet (e.g. deeplink or app-specific URL).
     */
    a: string;
}
