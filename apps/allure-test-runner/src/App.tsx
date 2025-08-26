import { useEffect, useState } from 'react';
import { TonConnectProvider } from './components/TonConnectProvider';
import { Header } from './components/Header';
import { STORAGE_KEYS } from './constants';
import { AuthForm } from './components/AuthForm';
import { TestRuns } from './components/TestRuns';

function App() {
    const [jwt, setJwt] = useState<string | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.jwtToken);
        if (saved) setJwt(saved);
    }, []);

    return (
        <TonConnectProvider>
            <div className="container">
                <Header />
                <main className="main-content">
                    {!jwt ? (
                        <AuthForm onSubmit={({ jwtToken }) => setJwt(jwtToken)} />
                    ) : (
                        <TestRuns jwtToken={jwt} />
                    )}
                </main>
            </div>
        </TonConnectProvider>
    );
}

export default App;
