---
'@tonconnect/sdk': patch
---

Reject unknown properties inside the `proof` object of a `ton_proof` connect item. The check already existed for the item itself and for its `error` object, so `proof` was the one level that let extras through.
