import { FunctionComponent } from 'react';
import TonConnectUIProvider from './components/TonConnectUIProvider';
import Test from './Test';
import { THEME } from '@tonconnect/ui';

const App: FunctionComponent = () => {
    return (
        <TonConnectUIProvider
            manifestUrl="https://ton-connect.github.io/demo-dapp/tonconnect-manifest.json"
            theme={THEME.DARK}
        >
            <Test />
        </TonConnectUIProvider>
    );
};

export default App;
