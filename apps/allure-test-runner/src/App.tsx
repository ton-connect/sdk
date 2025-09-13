import { RouterProvider } from 'react-router-dom';
import { TonConnectProvider } from './providers/TonConnectProvider';
import { AuthForm } from './components/AuthForm';
import { AuthProvider, useAuth } from './providers/AuthProvider';
import { router } from './routes';
import { useEffect } from 'react';
import { setupViewportHeight } from './utils/viewport';

function AppContent() {
    const { isAuthenticated } = useAuth();

    return (
        <div className="min-h-screen-safe bg-background text-foreground">
            {!isAuthenticated ? (
                <main className="container mx-auto flex min-h-screen-safe items-center justify-center px-4 py-8 sm:px-6 md:px-8 lg:px-12 xl:px-16">
                    <AuthForm />
                </main>
            ) : (
                <RouterProvider router={router} />
            )}
        </div>
    );
}

function App() {
    // Setup viewport height handling for iPhone Safari
    useEffect(() => {
        const cleanup = setupViewportHeight();
        return cleanup;
    }, []);

    return (
        <TonConnectProvider>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </TonConnectProvider>
    );
}

export default App;
