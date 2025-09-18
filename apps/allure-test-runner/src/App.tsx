import { RouterProvider } from 'react-router-dom';
import { TonConnectProvider } from './providers/TonConnectProvider';
import { AuthProvider } from './providers/AuthProvider';
import { router } from './routes';
import { useEffect } from 'react';
import { setupViewportHeight } from './utils/viewport';

function App() {
    // Setup viewport height handling for iPhone Safari
    useEffect(() => {
        return setupViewportHeight();
    }, []);

    return (
        <TonConnectProvider>
            <AuthProvider>
                <div className="min-h-screen bg-background text-foreground">
                    <RouterProvider router={router} />
                </div>
            </AuthProvider>
        </TonConnectProvider>
    );
}

export default App;
