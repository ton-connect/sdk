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
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

    const {
        data: user,
        error,
        refetch
    } = useGetMeQuery(undefined, {
        skip: !token
    });

    useEffect(() => {
        dispatch(initializeAuth());
    }, [dispatch]);

    useEffect(() => {
        if (token) {
            refetch();
        }
    }, [token, refetch]);

    useEffect(() => {
        if (user) {
            setIsAuthenticated(true);
        } else if (error) {
            setIsAuthenticated(false);
            setToken(null);
            localStorage.removeItem('token');
        }
    }, [user, error]);

    const handleAuthSuccess = (newToken: string) => {
        setToken(newToken);
        localStorage.setItem('token', newToken);
        setIsAuthenticated(true);
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
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

    const handleLogout = () => {
        setToken(null);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
    };

    return {
        token,
        isAuthenticated,
        logout: handleLogout
    };
}
