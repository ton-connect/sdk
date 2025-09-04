import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { TonConnectProvider } from './providers/TonConnectProvider';
import { Header } from './components/Header';
import { STORAGE_KEYS } from './constants';
import { AuthForm } from './components/AuthForm';
import { AuthProvider } from './providers/AuthProvider';
import { router } from './routes';
import { isMoreThanDayToExpire } from './utils/jwt';

function App() {
    const [jwt, setJwt] = useState<string>();

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.jwtToken);
        if (saved && isMoreThanDayToExpire(saved)) {
            setJwt(saved);
        }
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
                            <RouterProvider router={router} />
                        )}
                    </main>
                </div>
            </AuthProvider>
        </TonConnectProvider>
    );
}

export default App;
