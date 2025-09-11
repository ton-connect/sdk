import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UIState {
    selectedLaunchId: number | null;
    isStatusModalOpen: boolean;
    isTestCaseDetailsOpen: boolean;
    selectedTestCaseId: number | null;
    sidebarCollapsed: boolean;
    theme: 'light' | 'dark';
}

const initialState: UIState = {
    selectedLaunchId: null,
    isStatusModalOpen: false,
    isTestCaseDetailsOpen: false,
    selectedTestCaseId: null,
    sidebarCollapsed: false,
    theme: 'light'
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setSelectedLaunchId: (state, action: PayloadAction<number | null>) => {
            state.selectedLaunchId = action.payload;
        },
        setIsStatusModalOpen: (state, action: PayloadAction<boolean>) => {
            state.isStatusModalOpen = action.payload;
        },
        setIsTestCaseDetailsOpen: (state, action: PayloadAction<boolean>) => {
            state.isTestCaseDetailsOpen = action.payload;
        },
        setSelectedTestCaseId: (state, action: PayloadAction<number | null>) => {
            state.selectedTestCaseId = action.payload;
        },
        setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
            state.sidebarCollapsed = action.payload;
        },
        setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
            state.theme = action.payload;
        },
        toggleSidebar: state => {
            state.sidebarCollapsed = !state.sidebarCollapsed;
        },
        toggleTheme: state => {
            state.theme = state.theme === 'light' ? 'dark' : 'light';
        },
        closeAllModals: state => {
            state.isStatusModalOpen = false;
            state.isTestCaseDetailsOpen = false;
            state.selectedTestCaseId = null;
        },
        resetUI: state => {
            state.selectedLaunchId = null;
            state.isStatusModalOpen = false;
            state.isTestCaseDetailsOpen = false;
            state.selectedTestCaseId = null;
        }
    }
});

export const {
    setSelectedLaunchId,
    setIsStatusModalOpen,
    setIsTestCaseDetailsOpen,
    setSelectedTestCaseId,
    setSidebarCollapsed,
    setTheme,
    toggleSidebar,
    toggleTheme,
    closeAllModals,
    resetUI
} = uiSlice.actions;

export { uiSlice };
