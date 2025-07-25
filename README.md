# 🚀 TON Connect

Welcome to the implementation of the TonConnect protocol! Before diving in, here's where to start:


- Easily connect users to your Dapp and start blockchain interactions:
  - [TON Connect UI React](https://www.npmjs.com/package/@tonconnect/ui-react): Seamlessly integrate wallet connection components into your React app.
  - [TON Connect UI](https://www.npmjs.com/package/@tonconnect/ui): Quickly add wallet connection components to your Dapp.


- For detailed information about the TonConnect protocol, visit the [official documentation](https://docs.ton.org/develop/dapps/ton-connect/overview).

- [📚 Latest API documentation](https://ton-connect.github.io/sdk/)

## 📦 Packages

The repository contains the following packages:

- [**@tonconnect/sdk**](https://www.npmjs.com/package/@tonconnect/sdk)
- [**@tonconnect/protocol**](https://www.npmjs.com/package/@tonconnect/protocol)
- [**@tonconnect/ui**](https://www.npmjs.com/package/@tonconnect/ui)
- [**@tonconnect/ui-react**](https://www.npmjs.com/package/@tonconnect/ui-react)

---

## 📘 TON Connect SDK
- **GitHub**: [link](https://github.com/ton-connect/sdk/tree/main/packages/sdk)
- **npm**: [link](https://www.npmjs.com/package/@tonconnect/sdk)
- **API Documentation**: [link](https://ton-connect.github.io/sdk/modules/_tonconnect_sdk.html)

Use this package to connect your app to TON wallets via the TonConnect protocol.
A full description can be found in the link above.

---

## 📗 TON Connect Protocol Models
- **GitHub**: [link](https://github.com/ton-connect/sdk/tree/main/packages/protocol)
- **npm**: [link](https://www.npmjs.com/package/@tonconnect/protocol)
- **API Documentation**: [link](https://ton-connect.github.io/sdk/modules/_tonconnect_protocol.html)

This package contains protocol requests, responses, and event models, along with encoding and decoding functions. Use it to integrate TonConnect into your wallet app (written with TypeScript). For integrating TonConnect into your dApp, use [@tonconnect/sdk](https://www.npmjs.com/package/@tonconnect/sdk).

---

## 📙 TON Connect UI
- **GitHub**: [link](https://github.com/ton-connect/sdk/tree/main/packages/ui)
- **npm**: [link](https://www.npmjs.com/package/@tonconnect/ui)
- **API Documentation**: [link](https://ton-connect.github.io/sdk/modules/_tonconnect_ui.html)

TonConnect UI is a UI kit for TonConnect SDK. Use it to connect your app to TON wallets via the TonConnect protocol. It simplifies integration using UI elements like the "connect wallet button," "select wallet dialog," and confirmation modals.

---

## 📕 TON Connect UI React
- **GitHub**: [link](https://github.com/ton-connect/sdk/tree/main/packages/ui-react)
- **npm**: [link](https://www.npmjs.com/package/@tonconnect/ui-react)
- **API Documentation**: [link](https://ton-connect.github.io/sdk/modules/_tonconnect_ui_react.html)

TonConnect UI React is a React UI kit for TonConnect SDK. Use it to connect your app to TON wallets via the TonConnect protocol in React apps.

import { TonClient, WalletContractV4 } from "@ton/ton";
import { mnemonicToWalletKey } from "@ton/crypto";

const client = new TonClient({ endpoint: 'https://ton-mainnet.io' });

export async function stakeTON(amount, duration) {
  try {
    LDObserve.startSpan('ton-staking-operation', { amount, duration });
    
    // 1. Dobijanje ključeva iz mnemonika (korisnikov wallet)
    const mnemonic = 'vaš-mnemonik-ovde'; // U praksi dobija se iz sigurnog izvora
    const key = await mnemonicToWalletKey(mnemonic.split(' '));
    
    // 2. Povezivanje sa walletom
    const wallet = WalletContractV4.create({ workchain: 0, publicKey: key.publicKey });
    const contract = client.open(wallet);
    
    // 3. Adresa staking ugovora (VAŠA ADRESA)
    const stakingContract = 1234567890;
    
    // 4. Slanje transakcije
    const seqno = await contract.getSeqno();
    await contract.sendTransfer({
      seqno,
      secretKey: key.secretKey,
      messages: [{
        address: stakingContract,
        amount: amount * 1000000000, // nanoTONs
        payload: 'stake:' + duration // custom poruka za staking
      }]
    });
    
    return { success: true, message: "TON uspešno zaključan!" };
  } catch (error) {
    LDObserve.recordError(error, 'TON Staking Error');
    throw new Error("Greška pri zaključavanju: " + error.message);
  }
}
---

## 🛠️ Development

Follow the instructions in [DEVELOPERS.md](./DEVELOPERS.md) to set up the development environment.
