import './App.scss';
import { THEME, TonConnectUIProvider, initializeWalletConnect } from '@tonconnect/ui-react';
import { Routes, Route } from 'react-router-dom';
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
import { UniversalConnector } from '@reown/appkit-universal-connector';
import { GaslessDemo } from './components/GaslessDemo/GaslessDemo';
import { OneClickPay } from './pages/OneClickPay/OneClickPay';
import { FrogDemo } from './pages/FrogDemo/FrogDemo';
import { CatDemo } from './pages/CatDemo/CatDemo';

initializeWalletConnect(UniversalConnector, {
    projectId: '9cb446f4a1b697039a23332618d942b0',
    metadata: {
        name: 'Demo DApp',
        icons: [
            'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0uc4aSvQASroq4VfMx30RkZzIX8wiefg3rQ&s'
        ],
        url: window.location.origin,
        description: 'Demo DApp'
    }
});

function HomePage() {
    return (
        <div className="app">
            <Header />
            <TxForm />
            <GaslessDemo />
            <WalletBatchLimitsTester />
            <SignDataTester />
            <TransferUsdt />
            <CreateJettonDemo />
            <TonProofDemo />
            <FindTransactionDemo />
            <MerkleExample />
            <Footer />
        </div>
    );
}

function IframePage() {
    return <iframe src="/" style={{ width: '100%', height: '100vh', border: 'none' }} />;
}

function IframeIframePage() {
    return <iframe src="/iframe" style={{ width: '100%', height: '100vh', border: 'none' }} />;
}

function App() {
    return (
        <TonConnectUIProvider
            manifestUrl="https://tonconnect-sdk-demo-dapp.vercel.app/tonconnect-manifest.json"
            uiPreferences={{ theme: THEME.DARK }}
            actionsConfiguration={{ returnStrategy: 'http://localhost:5173/frog' }}
            walletsListConfiguration={{
                includeWallets: [
                    {
                        name: 'Wallet',
                        appName: 'wallet_kit',
                        aboutUrl: 'localhost:5555',
                        bridgeUrl: 'https://connect.ton.org/bridge',
                        imageUrl: 'https://walletkit-demo-wallet.vercel.app/ton.svg',
                        universalLink: 'http://localhost:5555/ton-connect',
                        platforms: ['chrome', 'safari', 'firefox', 'ios', 'android'],
                        features: [
                            {
                                name: 'SendTransaction',
                                maxMessages: 255,
                                extraCurrencySupported: true,
                                itemTypes: ['ton', 'jetton', 'nft']
                            },
                            {
                                name: 'SignData',
                                types: ['text', 'binary', 'cell']
                            },
                            {
                                name: 'SignMessage',
                                maxMessages: 4,
                                extraCurrencySupported: true,
                                itemTypes: ['ton', 'jetton', 'nft']
                            },
                            {
                                name: 'EmbeddedRequest'
                            }
                        ]
                    }
                ]
            }}
        >
            <div>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/pay" element={<OneClickPay />} />
                    <Route path="/frog" element={<FrogDemo />} />
                    <Route path="/cat" element={<CatDemo />} />
                    <Route path="/iframe" element={<IframePage />} />
                    <Route path="/iframe/iframe" element={<IframeIframePage />} />
                </Routes>
            </div>
        </TonConnectUIProvider>
    );
}

export default App;
