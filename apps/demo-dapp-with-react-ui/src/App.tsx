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
            analytics={{ mode: 'full' }}
            manifestUrl="https://tonconnect-sdk-demo-dapp.vercel.app/tonconnect-manifest.json"
            uiPreferences={{ theme: THEME.DARK }}
        >
            <div>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/iframe" element={<IframePage />} />
                    <Route path="/iframe/iframe" element={<IframeIframePage />} />
                </Routes>
            </div>
        </TonConnectUIProvider>
    );
}

export default App;
