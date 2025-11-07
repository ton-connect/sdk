import './App.scss';
import { THEME, TonConnectUIProvider } from '@tonconnect/ui-react';
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
import { MultiFrame } from './components/MultiFrame/MultiFrame';

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
            manifestUrl="https://tonconnect-sdk-demo-dapp.vercel.app/tonconnect-manifest.json"
            uiPreferences={{ theme: THEME.DARK }}
        >
            <div>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/iframe" element={<IframePage />} />
                    <Route path="/iframe/iframe" element={<IframeIframePage />} />
                    <Route path="/multiframe" element={<MultiFrame />} />
                </Routes>
            </div>
        </TonConnectUIProvider>
    );
}

export default App;
