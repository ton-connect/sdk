import { useState, useCallback, useMemo } from 'react';
import { useAppDispatch } from '../../store/hooks';
import { setToken } from '../../store/slices/authSlice';
import { useAuthenticateMutation } from '../../store/api/allureApi';
import './AuthForm.scss';

export function AuthForm() {
    const [userToken, setUserToken] = useState('');
    const [error, setError] = useState<string | null>(null);
    const dispatch = useAppDispatch();
    const [authenticate, { isLoading: loading }] = useAuthenticateMutation();

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            if (!userToken.trim()) {
                setError('User API token is required');
                return;
            }
            try {
                setError(null);
                const access = await authenticate({ userToken }).unwrap();
                dispatch(setToken(access));
            } catch (e: unknown) {
                const errorMessage = e instanceof Error ? e.message : 'Failed to authenticate';
                setError(errorMessage);
            }
        },
        [userToken, authenticate, dispatch]
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
