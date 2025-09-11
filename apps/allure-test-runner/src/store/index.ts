import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from './slices/authSlice.js';
import { launchesSlice } from './slices/launchesSlice.js';
import { uiSlice } from './slices/uiSlice.js';
import { allureApi } from './api/allureApi.js';

export const store = configureStore({
    reducer: {
        auth: authSlice.reducer,
        launches: launchesSlice.reducer,
        ui: uiSlice.reducer,
        [allureApi.reducerPath]: allureApi.reducer
    },
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [allureApi.util.resetApiState.type]
            }
        }).concat(allureApi.middleware)
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
