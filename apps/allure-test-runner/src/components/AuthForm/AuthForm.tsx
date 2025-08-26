import { useState } from 'react';
import { STORAGE_KEYS } from '../../constants';
import { AllureApiClient } from '../../api/allure.api';
import './AuthForm.scss';

type Props = {
    onSubmit: (params: { jwtToken: string }) => void;
};

export function AuthForm({ onSubmit }: Props) {
    const [userToken, setUserToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userToken.trim()) {
            setError('User API token is required');
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const api = new AllureApiClient({});
            const access = await api.authenticate(userToken);
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
                <button
                    type="submit"
                    disabled={!userToken.trim()}
                    className="btn btn-primary auth-form__submit"
                >
                    Save & Continue
                </button>
                {loading && 'Loading...'} // TODO make nice y.mileika
            </form>
        </div>
    );
}
