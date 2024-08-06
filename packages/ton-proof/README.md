
# TonProofService

## Overview

`TonProofService` is a service for verifying proofs in the TON blockchain ecosystem. It includes methods for generating payloads and validating proofs against specified criteria. This service helps ensure the validity of user addresses, which can be used for authentication and validation purposes within TON-based applications.

## Installation

To install the necessary dependencies, use the following commands:

```sh
npm install @tonconnect/ton-proof
```

Check [documentation](https://docs.ton.org/develop/dapps/ton-connect/sign#structure-of-ton_proof) to see payload structure

### Usage
Below is an example of how to use the TonProofService in a TypeScript project:

```js

import { TonProofService } from '@tonconnect/ton-proof';

// Initialize the service
const tonProofService = new TonProofService({
  allowedDomains: ['your-domain.com'],
  tonProofPrefix: 'your-prefix/',
  tonConnectPrefix: 'your-connect-prefix'
});

// Generate a random payload
const payload = tonProofService.generatePayload();
console.log('Generated Payload:', payload);

// Check proof
const isValid = await tonProofService.checkProof(yourPayload, getWalletPublicKeyFunction);
console.log('Is proof valid:', isValid);
```

#### Class: TonProofService
Constructor
- allowedDomains: An optional array of allowed domains for validation.
- tonProofPrefix: An optional prefix for the proof. (Using in message generation)
- tonConnectPrefix: An optional prefix for the connect. (Using in message generation)
- wallets: An optional list of custom wallets.

#### Methods
`generatePayload`
Generates a random payload. (in `hex`)

```js
const payload = tonProofService.generatePayload();
console.log('Generated Payload:', payload);
```
`checkProof`
Reference implementation of the checkProof method:
Parameters:

- payload: An object containing the proof data.
- getWalletPublicKey: A function that takes an address and returns a public key. (If wallet isn't compatible)

Compatible wallets:
- WalletContractV1R1,
- WalletContractV1R2,
- WalletContractV1R3,
- WalletContractV2R1,
- WalletContractV2R2,
- WalletContractV3R1,
- WalletContractV3R2,
- WalletContractV4R2

#### You can add your own custom wallet using `wallets` parameter:

```js
export class CustomContract {
    static create(): InitContract {
        const init = {
            data: Cell.fromBase64('...your code'),
            code: Cell.fromBase64('...your code')
        };
        return { init };
    }
}

function loadCustomContractData(cs: Slice) {
    const seqno = cs.loadUint(32);
    const publicKey = cs.loadBuffer(32);
    return { seqno, publicKey };
}

const customContractData: WalletOptions = {
    contract: CustomContract,
    loadData: loadCustomContractData
};

const tonProofService = new TonProofService({
    wallets: [customContractData]
});

```

#### Default Values
The TonProofService class has the following default values:

- defaultTonProofPrefix: 'ton-proof-item-v2/'
- defaultTonConnectPrefix: 'ton-connect'
- defaultAllowedDomains: ['ton-connect.github.io']
- wallets: DEFAULT_WALLETS
