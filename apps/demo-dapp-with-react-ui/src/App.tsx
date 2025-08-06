import './App.scss';
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

function App() {
    return (
        <TonConnectUIProvider
            manifestUrl="https://tonconnect-sdk-demo-dapp.vercel.app/tonconnect-manifest.json"
            uiPreferences={{ theme: THEME.DARK }}
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
