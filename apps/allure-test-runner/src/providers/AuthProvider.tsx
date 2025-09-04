import React, { createContext, useContext } from 'react';

type AuthContextValue = { token?: string } | null;

const AuthContext = createContext<AuthContextValue>(null);

type Props = {
    token: string | undefined;
    children: React.ReactNode;
};

export function AuthProvider({ token, children }: Props) {
    return <AuthContext.Provider value={{ token }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}
