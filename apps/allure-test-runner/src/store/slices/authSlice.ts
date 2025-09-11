import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { STORAGE_KEYS } from '../../constants';
import { isMoreThanDayToExpire } from '../../utils/jwt';

interface AuthState {
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const initialState: AuthState = {
    token: null,
    isAuthenticated: false,
    isLoading: true
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setToken: (state, action: PayloadAction<string>) => {
            state.token = action.payload;
            state.isAuthenticated = true;
            localStorage.setItem(STORAGE_KEYS.jwtToken, action.payload);
        },
        clearToken: state => {
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem(STORAGE_KEYS.jwtToken);
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        initializeAuth: state => {
            const savedToken = localStorage.getItem(STORAGE_KEYS.jwtToken);
            if (savedToken && isMoreThanDayToExpire(savedToken)) {
                state.token = savedToken;
                state.isAuthenticated = true;
            }
            state.isLoading = false;
        }
    }
});

export const { setToken, clearToken, setLoading, initializeAuth } = authSlice.actions;
export { authSlice };
