import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { enableQaMode } from '@tonconnect/ui-react';
import './polyfills';
import './index.css';
import App from './App';

enableQaMode();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>
);
