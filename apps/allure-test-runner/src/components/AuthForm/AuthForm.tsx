import { useState, useCallback, useMemo } from 'react';
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

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
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
        },
        [userToken, onSubmit]
    );

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setUserToken(e.target.value);
    }, []);

    const isSubmitDisabled = useMemo(() => !userToken.trim() || loading, [userToken, loading]);

    const buttonContent = useMemo(() => {
        if (loading) {
            return (
                <>
                    <div className="auth-form__submit-spinner"></div>
                    Authenticating...
                </>
            );
        }
        return 'Save & Continue';
    }, [loading]);

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
                        onChange={handleInputChange}
                        placeholder="Enter your API token"
                        className="auth-form__input"
                        autoComplete="off"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isSubmitDisabled}
                    className="btn btn-primary auth-form__submit"
                >
                    {buttonContent}
                </button>
            </form>
        </div>
    );
}
