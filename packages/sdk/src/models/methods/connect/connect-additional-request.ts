import { ChainId } from '@tonconnect/protocol';

export interface ConnectAdditionalRequest {
    /**
     * Payload for ton_proof
     */
    tonProof?: string;

    /**
     * Desired network id for the session (e.g., '-239', '-3', or custom).
     * If wallet connects with a different chain, the SDK will throw an error and abort connection.
     * Can only be set during connect, not changed afterwards.
     */
    network?: ChainId;
}
