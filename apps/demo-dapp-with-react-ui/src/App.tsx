import './App.scss'
import {THEME, TonConnectUIProvider} from "@tonconnect/ui-react";
import {Header} from "./components/Header/Header";
import {TxForm} from "./components/TxForm/TxForm";
import {Footer} from "./components/Footer/Footer";
import {TonProofDemo} from "./components/TonProofDemo/TonProofDemo";
import {CreateJettonDemo} from "./components/CreateJettonDemo/CreateJettonDemo";
import {WalletBatchLimitsTester} from "./components/WalletBatchLimitsTester/WalletBatchLimitsTester";
import {SignDataTester} from "./components/SignDataTester/SignDataTester";
import { MerkleExample } from "./components/MerkleExample/MerkleExample";
import { FindTransactionDemo } from './components/FindTransactionDemo/FindTransactionDemo';
import { TransferUsdt } from './components/TransferUsdt/TransferUsdt';

function App() {
  return (
      <TonConnectUIProvider
          manifestUrl="https://ton-connect.github.io/demo-dapp-with-react-ui/tonconnect-manifest.json"
          uiPreferences={{ theme: THEME.DARK }}
          walletsListConfiguration={{
            includeWallets: [
              {
                appName: "tonwallet",
                name: "TON Wallet",
                imageUrl: "https://wallet.ton.org/assets/ui/qr-logo.png",
                aboutUrl: "https://chrome.google.com/webstore/detail/ton-wallet/nphplpgoakhhjchkkhmiggakijnkhfnd",
                universalLink: "https://wallet.ton.org/ton-connect",
                jsBridgeKey: "tonwallet",
                bridgeUrl: "https://bridge.tonapi.io/bridge",
                platforms: ["chrome", "android"]
              },
              {
                appName: "nicegramWallet",
                name: "Nicegram Wallet",
                imageUrl: "https://static.nicegram.app/icon.png",
                aboutUrl: "https://nicegram.app",
                universalLink: "https://nicegram.app/tc",
                deepLink: "nicegram-tc://",
                jsBridgeKey: "nicegramWallet",
                bridgeUrl: "https://tc.nicegram.app/bridge",
                platforms: ["ios", "android", "macos", "windows", "linux"]
              },
              {
                appName: "cdcTonWallet",
                name: "Crypto.com DeFi Wallet",
                imageUrl: "https://apro-ncw-api-file.crypto.com/wallet/logo",
                aboutUrl: "https://crypto.com/defi-wallet",
                universalLink: "https://wallet.crypto.com/deeplink/ton-connect",
                deepLink: "dfw://",
                jsBridgeKey: "cdcTonWallet",
                bridgeUrl: "https://wallet.crypto.com/sse/tonbridge",
                platforms: ["ios", "android", "chrome"]
              },
              {
                appName: "trustwalletTon",
                name: "Trust",
                imageUrl: "https://assets-cdn.trustwallet.com/dapps/trust.logo.png",
                aboutUrl: "https://trustwallet.com/about-us",
                bridgeUrl: "https://tonconnect.trustwallet.com/bridge",
                universalLink: "https://link.trustwallet.com/tc",
                deepLink: "trust://ton-connect",
                jsBridgeKey: "trustwalletTon",
                platforms: ["chrome", "ios", "android"]
              },
              {
                appName: "onekey",
                name: "OneKey",
                imageUrl: "https://uni.onekey-asset.com/static/logo/onekey-x288.png",
                aboutUrl: "https://onekey.so",
                jsBridgeKey: "onekeyTonWallet",
                platforms: ["chrome"]
              },
              {
                appName: "hpyTonWallet",
                name: "HyperPay Wallet",
                imageUrl: "https://onchain-oss.hyperpay.online/images/logo.png",
                aboutUrl: "https://www.hyperpay.tech",
                universalLink: "https://www.hyperpay.tech/download&deeplink=hyperpay://web3/wallet/tonconnect",
                jsBridgeKey: "hpyTonWallet",
                bridgeUrl: "https://onchain-wallet.hyperpay.online/bridge",
                platforms: ["ios", "android", "macos", "windows", "linux"]
              },
              {
                appName: "unstoppable",
                name: "Unstoppable Wallet",
                imageUrl: "https://unstoppable.money/logo288.png",
                aboutUrl: "https://unstoppable.money/",
                universalLink: "https://unstoppable.money/ton-connect",
                bridgeUrl: "https://bridge.unstoppable.money/bridge",
                platforms: ["ios", "android", "macos", "windows", "linux"]
              },
              {
                appName: "foxwallet",
                name: "FoxWallet",
                imageUrl: "https://hc.foxwallet.com/img/logo.png",
                aboutUrl: "https://foxwallet.com/",
                universalLink: "https://link.foxwallet.com/tc",
                jsBridgeKey: "foxwallet",
                bridgeUrl: "https://connect.foxwallet.com/ton/bridge",
                platforms: ["ios", "android", 'macos', 'windows', 'linux']
              },
              {
                appName: "jambo",
                name: "Jambo",
                imageUrl: "https://cdn-prod.jambotechnology.xyz/content/jambo_288x288_02da416a6c.png",
                aboutUrl: "https://www.jambo.technology/",
                deepLink: "jambotc://",
                universalLink: "https://jambophone.xyz/",
                bridgeUrl: "https://bridge.tonapi.io/bridge",
                jsBridgeKey: "jambowallet",
                platforms: ['android', 'macos', 'windows', 'linux']
              },
              {
                appName: "Gate.io wallet",
                name: "Gate.io wallet",
                imageUrl: "https://gimg2.gateimg.com/tgwallet/1730688473495507406-Gatewallet.png",
                aboutUrl: "https://www.gate.io",
                universalLink: "https://t.me/gateio_wallet_bot?attach=wallet",
                bridgeUrl: "https://dapp.gateio.services/tonbridge_api/bridge/v1",
                platforms: ["ios", "android", "linux", "windows", "macos"]
              },
              {
                appName: "coin98",
                name: "Coin98 ",
                imageUrl: "https://coin98.s3.ap-southeast-1.amazonaws.com/SocialLogo/ninetyeight.png",
                aboutUrl: "https://docs.coin98.com",
                deepLink: "coin98://ton-connect",
                bridgeUrl: "https://ton-bridge.coin98.tech/bridge",
                platforms: ["ios", "android"],
                universalLink: "https://coin98.com/ton-connect"
              },
              {
                appName: "coin98TelegramWallet",
                name: "Coin98 Telegram Wallet",
                imageUrl: "https://coin98.s3.ap-southeast-1.amazonaws.com/SocialLogo/ninetyeight.png",
                aboutUrl: "https://docs.coin98.com",
                universalLink: "https://t.me/Coin98_bot?attach=wallet",
                bridgeUrl: "https://ton-bridge.coin98.tech/bridge",
                platforms: ["ios", "android", "macos", "windows", "linux"]
              },
              {
                appName: "miraiapp",
                name: "Mirai App",
                imageUrl: "https://cdn.mirailabs.co/miraihub/miraiapp-icon-288.png",
                aboutUrl: "https://mirai.app",
                universalLink: "https://go.miraiapp.io/ton-connect",
                deepLink: "miraiapp://",
                bridgeUrl: "https://bridge.tonapi.io/bridge",
                jsBridgeKey: "miraiapp",
                platforms: ["ios", "android", "chrome", "firefox"]
              },
              {
                appName: 'nestwallet',
                name: 'Nest Wallet',
                imageUrl: 'https://storage.googleapis.com/nestwallet-public-resource-bucket/logo/nest_logo_square.png',
                aboutUrl: 'https://www.nestwallet.xyz',
                jsBridgeKey: 'nestwallet',
                platforms: ['chrome']
              },
              {
                appName: "tonflow",
                name: "TONFLOW",
                imageUrl: "https://tonflow.app/assets/images/tonflow_ico_256.png",
                aboutUrl: "https://tonflow.app",
                universalLink: "https://tonflow.app/ton-connect",
                deepLink: "tonflow-tc://",
                bridgeUrl: "https://bridge.tonapi.io/bridge",
                jsBridgeKey: "tonflow",
                platforms: ["windows", "linux", "macos", "chrome"]
              },
              {
                appName: 'Tonkeeper',
                name: 'TonkeeperWeb',
                imageUrl: 'https://raw.githubusercontent.com/tonkeeper/tonkeeper-web/0f197474c57937787608697e794ef2b20a62f0d4/apps/twa/public/logo-128x128.png',
                aboutUrl: 'https://wallet.tonkeeper.com/',
                universalLink: 'https://wallet.tonkeeper.com/ton-connect',
                bridgeUrl: "https://bridge.tonapi.io/bridge",
                platforms: ["ios", "android", "macos", "windows", "linux"]
              },
              {
                appName: "u2uWallet",
                name: "U2U Wallet",
                imageUrl: "https://u2-images.s3.ap-southeast-1.amazonaws.com/hdw/logo.jpg",
                aboutUrl: "https://u2u.xyz/ecosystem",
                deepLink: "u2wallet-tc://",
                universalLink: "https://u2u-wallet-app.uniultra.xyz/ton-connect",
                bridgeUrl: "https://ton-bridge.uniultra.xyz/bridge",
                platforms: ["ios", "android"]
              },
              {
                appName: "koloWeb3Wallet",
                name: "Kolo Web3 Wallet",
                imageUrl: "https://raw.githubusercontent.com/onidev1/tc-assets/refs/heads/main/kolo_logo_288.png",
                aboutUrl: "https://kolo.xyz",
                universalLink: "https://t.me/kolo?attach=wallet",
                bridgeUrl: "https://web3-bridge.kolo.in/bridge",
                platforms: ["ios", "android", "macos", "windows", "linux"],
                features: [
                  {
                    name: "SendTransaction",
                    maxMessages: 4,
                    extraCurrencySupported: false
                  }
                ]
              },
              {
                appName: "walletverse",
                name: "Walletverse",
                imageUrl: "https://bridge.walletverse.io/logo.png",
                aboutUrl: "https://walletverse.io",
                universalLink: "https://bridge.walletverse.io/tonconnect",
                bridgeUrl: "https://bridge.walletverse.io/sse/bridge",
                jsBridgeKey: "walletverse",
                platforms: ["ios", "android"]
              },
              {
                appName: "bybitMiniWallet",
                name: "Bybit Mini Wallet",
                imageUrl: "https://raw.githubusercontent.com/bybit-web3/bybit-web3.github.io/main/docs/images/bybit-logo.png",
                aboutUrl: "https://www.bybit.com/web3",
                universalLink: "https://t.me/Bybit_Web3_wallet_bot?attach=wallet",
                bridgeUrl: "https://api-node.bybit.com/spot/api/web3/bridge/ton/bridge",
                platforms: ["ios", "android", "macos", "windows", "linux"]
              },
              {
                appName: "ONTO",
                name: "ONTO",
                imageUrl: "https://app.ont.io/ontoMsgPic/onto.png",
                tondns: "onto.app",
                aboutUrl: "https://onto.app",
                universalLink: "https://link.onto.app/ton-connect",
                jsBridgeKey: "onto",
                platforms: ["ios", "android"]
              },
              {
                appName: "defiway",
                name: "Defiway",
                imageUrl: "https://fs.defiway.com/icons/tonconnect-icon.png",
                aboutUrl: "https://wallet.defiway.com",
                universalLink: "https://wallet.defiway.com/ton-connect",
                deepLink: "defiway-tc://",
                bridgeUrl: "https://api.defiway.com/ton-connect",
                jsBridgeKey: "defiway",
                platforms: ["ios", "android", "chrome", "safari"]
              },
              {
                appName: "exoduswallet",
                name: "Exodus",
                imageUrl: "https://www.exodus.com/brand/dl/images/Exodus_symbol.png",
                aboutUrl: "https://www.exodus.com/",
                jsBridgeKey: "exoduswallet",
                platforms: ["ios", "android", "chrome"]
              },
              {
                appName: "echoooTonWallet",
                name: "EchoooWallet",
                imageUrl: "https://cdn.echooo.xyz/front-end/fw/2025-01-20/f27b7b41-66b4-4b5d-b3d4-a3ac1d8b34ba.png",
                aboutUrl: "https://www.echooo.xyz",
                universalLink: "https://www.echooo.xyz/ton-connect",
                deepLink: "echooo://",
                jsBridgeKey: "echoooTonWallet",
                bridgeUrl: "https://ton-connect-bridge.echooo.link/bridge",
                platforms: ["ios", "android", "macos", "windows", "linux"]
              },
              {
                appName: "hot",
                name: "HOT",
                imageUrl: "https://raw.githubusercontent.com/hot-dao/media/main/logo.png",
                aboutUrl: "https://hot-labs.org/",
                universalLink: "https://t.me/herewalletbot?attach=wallet",
                bridgeUrl: "https://sse-bridge.hot-labs.org",
                jsBridgeKey: "hotWallet",
                platforms: ["ios", "android", "macos", "windows", "linux", "chrome", "safari", "firefox"]
              },
              {
                appName: "okxTonWallet",
                name: "OKX",
                imageUrl: "https://static.okx.com/cdn/assets/imgs/247/58E63FEA47A2B7D7.png",
                aboutUrl: "https://www.okx.com/web3",
                universalLink: "https://www.okx.com/download?appendQuery=true&deeplink=okx://web3/wallet/tonconnect",
                bridgeUrl: "https://www.okx.com/tonbridge/discover/rpc/bridge",
                jsBridgeKey: "okxTonWallet",
                platforms: ["chrome", "safari", "firefox", "ios", "android"],
                features: [
                  {
                    name: "SendTransaction",
                    maxMessages: 4,
                    extraCurrencySupported: false
                  }
                ]
              },
              {
                appName: "okxWallet",
                name: "OKX Wallet",
                imageUrl: "https://static.coinall.ltd/cdn/wallet/banner/7d3ef66c-a121-489f-8621-579ea9faf240-288_appicon.png",
                aboutUrl: "https://web3.okx.com",
                universalLink: "https://web3.okx.com/download?appendQuery=true&deeplink=okxwallet://web3/wallet/tonconnect",
                bridgeUrl: "https://web3.okx.com/tonbridge/discover/rpc/bridge",
                jsBridgeKey: "okxTonWallet",
                platforms: ["chrome", "safari", "firefox", "ios", "android"],
                features: [
                  {
                    name: "SendTransaction",
                    maxMessages: 4,
                    extraCurrencySupported: false
                  }
                ]
              },
              {
                appName: "Fearless",
                name: "Fearless",
                imageUrl: "https://raw.githubusercontent.com/soramitsu/shared-features-utils/master/icons/FW_icon_288.png",
                aboutUrl: "https://fearlesswallet.io",
                universalLink: "https://fearlesswallet.io/ton-connect",
                bridgeUrl: "https://fearless-ton-bridge.odachi.soramitsu.co.jp/bridge",
                jsBridgeKey: "Fearless",
                platforms: ["ios", "android", "chrome"]
              },
              {
                appName: "blitzwallet",
                name: "BLITZ wallet",
                imageUrl: "https://blitzwallet.cfd/wallet/public/logo.png",
                aboutUrl: "https://blitzwallet.cfd",
                universalLink: "https://t.me/blitz_wallet_bot?attach=wallet",
                bridgeUrl: "https://blitzwallet.cfd/bridge/",
                platforms: ["ios", "android", "macos", "windows", "linux"],
                features: [
                  {
                    name: "SendTransaction",
                    maxMessages: 4,
                    extraCurrencySupported: false
                  }
                ]
              },
              {
                appName: "GateWallet",
                name: "GateWallet",
                imageUrl: "https://img.gatedataimg.com/prd-ordinal-imgs/036f07bb8730716e/gateio-0925.png",
                aboutUrl: "https://www.gate.io/",
                jsBridgeKey: "gatetonwallet",
                bridgeUrl: "https://dapp.gateio.services/tonbridge_api/bridge/v1",
                platforms: ["ios", "android"],
                universalLink: "https://gate.onelink.me/Hls0/web3?gate_web3_wallet_universal_type=ton_connect",
                features: [
                  {
                    name: "SendTransaction",
                    maxMessages: 4,
                    extraCurrencySupported: false
                  }
                ]
              },
              {
                appName: "cactuslink",
                name: "Cactus Link",
                imageUrl: "https://downloads.mycactus.com/288_cactus_link.png",
                aboutUrl: "https://www.mycactus.com/defi-connector",
                jsBridgeKey: "cactuslink_ton",
                platforms: ["chrome"],
                features: [
                  {
                    name: "SendTransaction",
                    maxMessages: 255,
                    extraCurrencySupported: false
                  },
                  {
                    name: "SignData",
                    types: [
                      "text", "binary"
                    ]
                  }
                ]
              }
            ]
          }}
          actionsConfiguration={{
              twaReturnUrl: 'https://t.me/DemoDappWithTonConnectBot/demo'
          }}
      >
        <div className="app">
            <Header />
            <TxForm />
            <WalletBatchLimitsTester />
            <SignDataTester />
            <TransferUsdt/>
            <CreateJettonDemo />
            <TonProofDemo />
            <FindTransactionDemo />
            <MerkleExample />
            <Footer />
        </div>
      </TonConnectUIProvider>
  )
}

export default App
