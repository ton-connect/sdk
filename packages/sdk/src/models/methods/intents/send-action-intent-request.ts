/**
 * Request for Send Action Intent (deep link).
 * Wallet will call the action URL (with address param) and execute the returned action.
 */
export interface SendActionIntentRequest {
    /**
     * Explicit sender address for the intent.
     * If omitted, the wallet will use its default selected account.
     */
    from?: string;

    /** Action URL the wallet will call to get action details. */
    actionUrl: string;
}
