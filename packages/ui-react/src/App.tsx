import { FunctionComponent, useEffect, useState } from 'react';
import './App.css';
import { TonConnectUi } from '@tonconnect/ui';

const App: FunctionComponent = () => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        console.log(123);
        const tc = new TonConnectUi({ buttonRootId: 'tc-root' });
    }, []);

    return (
        <div className="App">
            <div id="tc-root"></div>
            <div>
                <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
                    <img src="/vite.svg" className="logo" alt="Vite logo" />
                </a>
            </div>
            <h1>Vite + React</h1>
            <div className="card">
                <button onClick={() => setCount(count => count + 1)}>count is {count}</button>
                <p>
                    Edit <code>src/App.tsx</code> and save to test HMR
                </p>
            </div>
            <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
        </div>
    );
};

export default App;
