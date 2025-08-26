import { useEffect, useState } from 'react';
import { STORAGE_KEYS } from '../../constants';
import { AllureApiClient } from '../../api/allure.api';
import './AuthForm.scss';

type Props = {
    onSubmit: (params: { jwtToken: string }) => void;
};

export function AuthForm({ onSubmit }: Props) {
    const [userToken, setUserToken] = useState('');
    const [jwtToken, setJwtToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setJwtToken(localStorage.getItem(STORAGE_KEYS.jwtToken) || '');
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!jwtToken.trim()) {
            setError('JWT token is required');
            return;
        }
        setError(null);
        localStorage.setItem(STORAGE_KEYS.jwtToken, jwtToken);
        onSubmit({ jwtToken });
    };

    const exchangeToken = async () => {
        if (!userToken.trim()) {
            setError('User API token is required');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const api = new AllureApiClient({});
            const access = await api.authenticate(userToken);
            setJwtToken(access);
            localStorage.setItem(STORAGE_KEYS.jwtToken, access);
            onSubmit({ jwtToken: access });
        } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : 'Failed to authenticate';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-form">
            <div className="auth-form__header">
                <h2 className="auth-form__title">Authentication</h2>
            </div>

            {error && (
                <div className="auth-form__error">
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form__form">
                <div className="auth-form__field">
                    <label className="auth-form__label">User API Token</label>
                    <input
                        type="password"
                        value={userToken}
                        onChange={e => setUserToken(e.target.value)}
                        placeholder="Enter your API token"
                        className="auth-form__input"
                    />
                </div>

                <div className="auth-form__actions">
                    <button
                        type="button"
                        onClick={exchangeToken}
                        disabled={loading || !userToken.trim()}
                        className="btn btn-warning auth-form__btn"
                    >
                        {loading ? 'Loading...' : 'Get JWT'}
                    </button>
                </div>

                <div className="auth-form__field">
                    <label className="auth-form__label">JWT Token (Bearer)</label>
                    <input
                        value={jwtToken}
                        onChange={e => setJwtToken(e.target.value)}
                        placeholder="Enter JWT token"
                        className="auth-form__input"
                    />
                </div>

                <button
                    type="submit"
                    disabled={!jwtToken.trim()}
                    className="btn btn-primary auth-form__submit"
                >
                    Save & Continue
                </button>
            </form>
        </div>
    );
}
