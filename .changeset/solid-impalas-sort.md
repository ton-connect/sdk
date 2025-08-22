---
'@tonconnect/sdk': patch
'@tonconnect/ui': patch
'@tonconnect/ui-react': patch
---

BREAKING: strict request validation is now enforced

**ton_proof**
- `payload` size **≤ 128 bytes**
- `domain` size **≤ 128 bytes**
- (`payload` + `domain`) size **≤ 222 bytes**

**sendTransaction (dApp → wallet)**
- Request is validated against the [**Requests and Responses** specification](https://github.com/ton-blockchain/ton-connect/blob/main/requests-responses.md)
- Invalid requests now fail.

**signData (dApp → wallet)**
- Request is validated against the [**Requests and Responses** specification](https://github.com/ton-blockchain/ton-connect/blob/main/requests-responses.md)
- Invalid requests now fail.

### Migration
- Keep `ton_proof` payload and `domain` within the limits above.
- Ensure your **sendTransaction** object strictly follows the specification.
- Ensure your **signData** request matches the specification.

If your app previously sent oversized `ton_proof` data or non-conformant requests, update them to pass the new checks or they will be rejected.
