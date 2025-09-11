import { RouterProvider } from 'react-router-dom';
import { TonConnectProvider } from './providers/TonConnectProvider';
import { Header } from './components/Header';
import { AuthForm } from './components/AuthForm';
import { AuthProvider, useAuth } from './providers/AuthProvider';
import { router } from './routes';

function AppContent() {
    const { isAuthenticated } = useAuth();

    return (
        <div className="container">
            <Header />
            <main className="main-content">
                {!isAuthenticated ? <AuthForm /> : <RouterProvider router={router} />}
            </main>
        </div>
    );
}

function App() {
    return (
        <TonConnectProvider>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </TonConnectProvider>
    );
}

export default App;
