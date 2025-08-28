import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LaunchesPage } from './LaunchesPage.tsx';
import { LaunchDetailsPage } from './LaunchDetailsPage.tsx';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Navigate to="/launches" replace />
    },
    {
        path: '/launches',
        element: <LaunchesPage />
    },
    {
        path: '/launches/:launchId',
        element: <LaunchDetailsPage />
    },
    {
        path: '/launches/:launchId/tests/:testId',
        element: <LaunchDetailsPage />
    }
]);
