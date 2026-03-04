import { ConnectRequest } from '@tonconnect/protocol';

export interface MakeSendActionIntentRequest {
    /**
     * Request ID
     */
    id: string;

    /**
     * Optional connect request for first-time connection
     */
    c?: ConnectRequest;

    /**
     * Action URL that the wallet will call to get the action details.
     * The wallet MUST add the `address` query parameter to this URL (the user's wallet address).
     * The action URL MUST respond with a JSON object containing `action_type` and `action` fields.
     */
    a: string;
}
