import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from './index';

// Auth selectors
export const selectAuth = (state: RootState) => state.auth;
export const selectToken = (state: RootState) => state.auth.token;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;

// Launches selectors
export const selectLaunches = (state: RootState) => state.launches;
export const selectLaunchesList = (state: RootState) => state.launches.launches;
export const selectLaunchesSearch = (state: RootState) => state.launches.search;
export const selectLaunchesLoading = (state: RootState) => state.launches.loading;
export const selectLaunchesLoadingMore = (state: RootState) => state.launches.loadingMore;
export const selectLaunchesError = (state: RootState) => state.launches.error;
export const selectLaunchesCompleteError = (state: RootState) => state.launches.completeError;
export const selectLaunchesHasMore = (state: RootState) => state.launches.hasMore;
export const selectLaunchesCurrentPage = (state: RootState) => state.launches.currentPage;
export const selectLaunchesTotalElements = (state: RootState) => state.launches.totalElements;

// UI selectors
export const selectUI = (state: RootState) => state.ui;
export const selectSelectedLaunchId = (state: RootState) => state.ui.selectedLaunchId;
export const selectIsStatusModalOpen = (state: RootState) => state.ui.isStatusModalOpen;
export const selectIsTestCaseDetailsOpen = (state: RootState) => state.ui.isTestCaseDetailsOpen;
export const selectSelectedTestCaseId = (state: RootState) => state.ui.selectedTestCaseId;
export const selectSidebarCollapsed = (state: RootState) => state.ui.sidebarCollapsed;
export const selectTheme = (state: RootState) => state.ui.theme;

// Memoized selectors
export const selectSelectedLaunch = createSelector(
    [selectLaunchesList, selectSelectedLaunchId],
    (launches, selectedLaunchId) =>
        selectedLaunchId ? launches.find(launch => launch.id === selectedLaunchId) : null
);

export const selectLaunchesByStatus = createSelector(
    [selectLaunchesList, (_state: RootState, status: string) => status],
    (launches, status) => launches.filter(launch => launch.status === status)
);

export const selectFilteredLaunches = createSelector(
    [selectLaunchesList, selectLaunchesSearch],
    (launches, search) => {
        if (!search.trim()) return launches;
        return launches.filter(launch => launch.name.toLowerCase().includes(search.toLowerCase()));
    }
);
