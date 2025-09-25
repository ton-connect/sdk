import './App.scss';
import { UIWallet } from '@tonconnect/ui';
import { THEME, TonConnectUIProvider } from '@tonconnect/ui-react';
import { Header } from './components/Header/Header';
import { TxForm } from './components/TxForm/TxForm';
import { Footer } from './components/Footer/Footer';
import { TonProofDemo } from './components/TonProofDemo/TonProofDemo';
import { CreateJettonDemo } from './components/CreateJettonDemo/CreateJettonDemo';
import { WalletBatchLimitsTester } from './components/WalletBatchLimitsTester/WalletBatchLimitsTester';
import { SignDataTester } from './components/SignDataTester/SignDataTester';
import { MerkleExample } from './components/MerkleExample/MerkleExample';
import { FindTransactionDemo } from './components/FindTransactionDemo/FindTransactionDemo';
import { TransferUsdt } from './components/TransferUsdt/TransferUsdt';

const walletLocal: UIWallet = {
    app_name: 'wallet_kit_demo_wallet_local',
    name: 'WalletKitDemoWalletLocal',
    image: 'https://ton.org/download/ton_symbol.png',
    about_url: 'https://walletkit-demo-wallet.vercel.app',
    universal_url: 'https://walletkit-demo-wallet.vercel.app/ton-connect',
    bridge: [
        {
            type: 'js',
            key: 'walletKitDemoWallet'
        },
        {
            type: 'sse',
            url: 'http://localhost:8081/bridge'
        }
    ],
    platforms: ['chrome', 'safari', 'firefox', 'ios', 'android'],
    features: [
        {
            name: 'SendTransaction',
            maxMessages: 255,
            extraCurrencySupported: true
        },
        {
            name: 'SignData',
            types: ['text', 'binary', 'cell']
        }
    ]
};

function App() {
    const isLocalMode = new URLSearchParams(window.location.search).get('mode') === 'local';
    return (
        <TonConnectUIProvider
            manifestUrl="https://tonconnect-sdk-demo-dapp.vercel.app/tonconnect-manifest.json"
            uiPreferences={{ theme: THEME.DARK }}
            walletsListConfiguration={isLocalMode ? walletLocal : {}}
        >
            <div className="app">
                <Header />
                <TxForm />
                <WalletBatchLimitsTester />
                <SignDataTester />
                <TransferUsdt />
                <CreateJettonDemo />
                <TonProofDemo />
                <FindTransactionDemo />
                <MerkleExample />
                <Footer />
            </div>
        </TonConnectUIProvider>
    );
}

export default App;
