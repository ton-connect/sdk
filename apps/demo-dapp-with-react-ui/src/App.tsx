import './App.scss';
import { THEME, TonConnectUIProvider } from '@tonconnect/ui-react';
import { IntentsShowcase } from './components/IntentsShowcase/IntentsShowcase';

function App() {
    return (
        <TonConnectUIProvider
            manifestUrl="https://sdk-demo-dapp-react-git-feat-intent-transactions-topteam.vercel.app/tonconnect-manifest.json"
            uiPreferences={{ theme: THEME.DARK }}
        >
            <IntentsShowcase />
        </TonConnectUIProvider>
    );
}

export default App;
