import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { store } from '../store';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { initializeAuth } from '../store/slices/authSlice';
import { selectAuthLoading } from '../store/selectors';
import { useGetMeQuery } from '../store/api/allureApi';
import { AuthForm } from '../components/AuthForm/AuthForm';

// Redux Provider wrapper
export function ReduxProvider({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
}

// Auth initialization component
function AuthInitializer({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    const isLoading = useAppSelector(selectAuthLoading);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [forceShowAuth, setForceShowAuth] = useState(false);

    const {
        data: user,
        error,
        refetch,
        isLoading: isMeLoading
    } = useGetMeQuery(undefined, {
        skip: !token
    });

    useEffect(() => {
        dispatch(initializeAuth());
    }, [dispatch]);

    useEffect(() => {
        if (token) {
            refetch();
        } else {
            setIsCheckingAuth(false);
        }
    }, [token, refetch]);

    useEffect(() => {
        if (user) {
            setIsAuthenticated(true);
            setIsCheckingAuth(false);
        } else if (error) {
            setIsAuthenticated(false);
            setToken(null);
            localStorage.removeItem('token');
            setIsCheckingAuth(false);
        }
    }, [user, error]);

    useEffect(() => {
        if (isMeLoading === false && token) {
            setIsCheckingAuth(false);
        }
    }, [isMeLoading, token]);

    const handleAuthSuccess = (newToken: string) => {
        setToken(newToken);
        localStorage.setItem('token', newToken);
        setIsAuthenticated(true);
        setIsCheckingAuth(false);
        setForceShowAuth(false);
    };

    const handleLogout = () => {
        setToken(null);
        setIsAuthenticated(false);
        setForceShowAuth(true);
        localStorage.removeItem('token');
    };

    // Expose logout function globally
    useEffect(() => {
        (window as unknown as { handleLogout?: () => void }).handleLogout = handleLogout;
        return () => {
            delete (window as unknown as { handleLogout?: () => void }).handleLogout;
        };
    }, []);

    if (isLoading || isCheckingAuth) {
        return null;
    }

    if (!isAuthenticated || forceShowAuth) {
        return <AuthForm onSuccess={handleAuthSuccess} />;
    }

    return <>{children}</>;
}

// Main AuthProvider that combines Redux and initialization
export function AuthProvider({ children }: { children: React.ReactNode }) {
    return (
        <ReduxProvider>
            <AuthInitializer>{children}</AuthInitializer>
        </ReduxProvider>
    );
}

// Hook for accessing auth state
export function useAuth() {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isAuthenticated, setIsAuthenticated] = useState(!!token);

    const { data: user } = useGetMeQuery(undefined, {
        skip: !token
    });

    const handleLogout = () => {
        // Use global logout function if available
        const globalLogout = (window as unknown as { handleLogout?: () => void }).handleLogout;
        if (globalLogout) {
            globalLogout();
        } else {
            // Fallback to local logout
            setToken(null);
            setIsAuthenticated(false);
            localStorage.removeItem('token');
        }
    };

    return {
        token,
        isAuthenticated,
        user,
        logout: handleLogout
    };
}
