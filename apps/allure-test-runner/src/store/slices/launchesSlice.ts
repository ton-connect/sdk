import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Launch } from '../../models';

interface LaunchesState {
    launches: Launch[];
    search: string;
    currentPage: number;
    totalElements: number;
    hasMore: boolean;
    loading: boolean;
    loadingMore: boolean;
    error: string | null;
    completeError: string | null;
}

const initialState: LaunchesState = {
    launches: [],
    search: '',
    currentPage: 0,
    totalElements: 0,
    hasMore: true,
    loading: false,
    loadingMore: false,
    error: null,
    completeError: null
};

const launchesSlice = createSlice({
    name: 'launches',
    initialState,
    reducers: {
        setSearch: (state, action: PayloadAction<string>) => {
            state.search = action.payload;
        },
        setLaunches: (state, action: PayloadAction<Launch[]>) => {
            state.launches = action.payload;
        },
        addLaunches: (state, action: PayloadAction<Launch[]>) => {
            // Avoid duplicates by checking existing IDs
            const existingIds = new Set(state.launches.map(launch => launch.id));
            const newLaunches = action.payload.filter(launch => !existingIds.has(launch.id));
            state.launches = [...state.launches, ...newLaunches];
        },
        setCurrentPage: (state, action: PayloadAction<number>) => {
            state.currentPage = action.payload;
        },
        setTotalElements: (state, action: PayloadAction<number>) => {
            state.totalElements = action.payload;
        },
        setHasMore: (state, action: PayloadAction<boolean>) => {
            state.hasMore = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setLoadingMore: (state, action: PayloadAction<boolean>) => {
            state.loadingMore = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        setCompleteError: (state, action: PayloadAction<string | null>) => {
            state.completeError = action.payload;
        },
        clearCompleteError: state => {
            state.completeError = null;
        },
        resetLaunches: state => {
            state.launches = [];
            state.currentPage = 0;
            state.totalElements = 0;
            state.hasMore = true;
            state.error = null;
            state.completeError = null;
        },
        updateLaunch: (state, action: PayloadAction<{ id: number; updates: Partial<Launch> }>) => {
            const { id, updates } = action.payload;
            const index = state.launches.findIndex(launch => launch.id === id);
            if (index !== -1) {
                state.launches[index] = { ...state.launches[index], ...updates };
            }
        }
    }
});

export const {
    setSearch,
    setLaunches,
    addLaunches,
    setCurrentPage,
    setTotalElements,
    setHasMore,
    setLoading,
    setLoadingMore,
    setError,
    setCompleteError,
    clearCompleteError,
    resetLaunches,
    updateLaunch
} = launchesSlice.actions;

export { launchesSlice };
