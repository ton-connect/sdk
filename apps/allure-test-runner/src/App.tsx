import { useEffect, useState } from 'react';
import { TonConnectProvider } from './components/TonConnectProvider';
import { Header } from './components/Header';
import { STORAGE_KEYS } from './constants';
import { AuthForm } from './components/AuthForm';
import { TestLaunches } from './components/TestLaunches';
import { AuthProvider } from './context/AuthContext';

function App() {
    const [jwt, setJwt] = useState<string>();

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.jwtToken);
        if (saved) setJwt(saved);
    }, []);

    return (
        <TonConnectProvider>
            <AuthProvider token={jwt}>
                <div className="container">
                    <Header />
                    <main className="main-content">
                        {!jwt ? (
                            <AuthForm onSubmit={({ jwtToken }) => setJwt(jwtToken)} />
                        ) : (
                            <TestLaunches />
                        )}
                    </main>
                </div>
            </AuthProvider>
        </TonConnectProvider>
    );
}

export default App;
