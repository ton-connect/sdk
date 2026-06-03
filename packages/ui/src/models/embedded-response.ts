import type {
    SendTransactionResponse,
    SignDataResponse,
    SignMessageResponse
} from '@tonconnect/sdk';

/**
 * Discriminated envelope returned by `TonConnectUI.sendTransaction` /
 * `signData` / `signMessage` when `enableEmbeddedRequest: true` is set on
 * the call. Without the flag the methods return the raw method response.
 *
 * Branch on `hasResponse`:
 *
 * - `hasResponse: true` — the wallet signed the request. `response` carries
 *   the regular method-specific result.
 * - `hasResponse: false` — the wallet completed the connect step but did
 *   not return a signed result.
 *
 * ### `dispatched` semantics
 *
 * - `dispatched: false` — the SDK did **not** put the request into the
 *   connect URL. The wallet never saw it.
 * - `dispatched: true` — the SDK **did** fold the request into the connect
 *   URL, but no signed result came back. The wallet may have already
 *   prompted the user (and potentially submitted the transaction). **Do
 *   not retry silently.** Surface a retry button and, where possible,
 *   verify on-chain or in your backend that the action hasn't already
 *   landed before re-prompting.
 *
 * @see [Connect-and-act in one tap (docs)](https://docs.ton.org/applications/ton-connect/how-to/embedded-request)
 * @see [Retry rules](https://docs.ton.org/applications/ton-connect/how-to/embedded-request#retry-rules)
 */
export type EmbeddedTResponse<TResponse> =
    | { response: TResponse; hasResponse: true }
    | {
          connectResult: {
              /**
               * `true` when the SDK actually folded the request into the
               * connect URL (so the wallet may have processed it without
               * returning a result). `false` when the request never left the
               * SDK.
               */
              dispatched: boolean;
          };
          hasResponse: false;
      };

export type EmbeddedSendTransactionResponse = EmbeddedTResponse<SendTransactionResponse>;
export type EmbeddedSignDataResponse = EmbeddedTResponse<SignDataResponse>;
export type EmbeddedSignMessageResponse = EmbeddedTResponse<SignMessageResponse>;
