import { FunctionComponent, useEffect } from 'react';
import { TonConnectUi } from '@tonconnect/ui';

const App: FunctionComponent = () => {
    useEffect(() => {
        const tc = new TonConnectUi({ buttonRootId: 'tc-root' });
    }, []);

    return (
        <div className="App">
            <div id="tc-root"></div>
        </div>
    );
};

export default App;
