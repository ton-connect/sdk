import { useEffect, useState } from 'react';
import './App.css';
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
        <div
            style={{
                maxWidth: 800,
                margin: '0 auto',
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 16
            }}
        >
            <h1 style={{ margin: 0 }}>Allure TestOps Stand</h1>
            <AuthForm onSubmit={({ jwtToken }) => setJwt(jwtToken)} />
            {jwt ? <TestRuns jwtToken={jwt} /> : <p>Enter endpoint and token to continue</p>}
        </div>
    );
}

export default App;
