import { DeviceInfo, TonProofItemReply } from '@tonconnect/protocol';
import { Account } from 'src/models';
import { SendTransactionResponse, SignDataResponse, SignMessageResponse } from 'src/models/methods';

/**
 * Parsed response to an embedded request.
 * Contains either a method-specific success result or an error.
 */
export type EmbeddedResponse =
    | { ok: true; result: SendTransactionResponse | SignDataResponse | SignMessageResponse }
    | { ok: false; error: { code: number; message: string; data?: unknown } };

export interface Wallet {
    /**
     * Information about user's wallet's device.
     */
    device: DeviceInfo;

    /**
     * Provider type: http bridge or injected js.
     */
    provider: 'http' | 'injected';

    /**
     * Selected account.
     */
    account: Account;

    /**
     * Response for connect items request.
     */
    connectItems?: {
        tonProof?: TonProofItemReply;
    };

    /**
     * Response to the embedded request.
     * Present only if an EmbeddedRequest was embedded in the connect URL
     * and the wallet processed it during connection.
     */
    embeddedResponse?: EmbeddedResponse;
}
