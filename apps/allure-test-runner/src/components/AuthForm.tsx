import { useEffect, useState } from 'react';
import { STORAGE_KEYS } from '../constants';
import { AllureApiClient } from '../api/allure.api';

type Props = {
    onSubmit: (params: { jwtToken: string }) => void;
};

export function AuthForm({ onSubmit }: Props) {
    const [userToken, setUserToken] = useState('');
    const [jwtToken, setJwtToken] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setJwtToken(localStorage.getItem(STORAGE_KEYS.jwtToken) || '');
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        localStorage.setItem(STORAGE_KEYS.jwtToken, jwtToken);
        onSubmit({ jwtToken });
    };

    const exchangeToken = async () => {
        try {
            setLoading(true);
            const api = new AllureApiClient({});
            const access = await api.authenticate(userToken);
            setJwtToken(access);
            localStorage.setItem(STORAGE_KEYS.jwtToken, access);
            onSubmit({ jwtToken: access });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'stretch' }}
        >
            <input
                type="password"
                value={userToken}
                onChange={e => setUserToken(e.target.value)}
                placeholder="User API token"
            />
            <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={exchangeToken} disabled={loading || !userToken}>
                    Get JWT
                </button>
                <input
                    value={jwtToken}
                    onChange={e => setJwtToken(e.target.value)}
                    placeholder="JWT (Bearer)"
                />
                <button type="submit" disabled={!jwtToken}>
                    Save
                </button>
            </div>
        </form>
    );
}
