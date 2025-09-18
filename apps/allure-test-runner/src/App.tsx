import { RouterProvider } from 'react-router-dom';
import { TonConnectProvider } from './providers/TonConnectProvider';
import { AuthProvider } from './providers/AuthProvider';
import { router } from './routes';

function App() {
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
