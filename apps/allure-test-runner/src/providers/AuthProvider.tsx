import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '../store';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { initializeAuth } from '../store/slices/authSlice';
import { selectAuthLoading } from '../store/selectors';

// Redux Provider wrapper
export function ReduxProvider({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
}

// Auth initialization component
function AuthInitializer({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    const isLoading = useAppSelector(selectAuthLoading);

    useEffect(() => {
        dispatch(initializeAuth());
    }, [dispatch]);

    if (isLoading) {
        return <div>Loading...</div>;
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
    const token = useAppSelector(state => state.auth.token);
    const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);

    return { token, isAuthenticated };
}
