/**
 * Request for Action Draft (deep link).
 * Wallet will call the action URL (with address param) and execute the returned action.
 */
export interface SendActionDraftRequest {
    /** Action URL the wallet will call to get action details. */
    actionUrl: string;
}
