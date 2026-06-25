import './patch-local-storage-for-github-pages';
import './polyfills';
import './core/styles/index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { initQaModeFromUrl } from './core/utils/qa-mode-from-url';
import { installWalletConsoleCapture } from './core/utils/wallet-console-capture';
import { runSingleInstance } from './core/utils/run-single-instance';
import { getTonconnectVersion } from './core/utils/get-tonconnect-version';

initQaModeFromUrl();
installWalletConsoleCapture();

getTonconnectVersion();

if (import.meta.env.DEV && !window.location.pathname.endsWith('/widget-preview')) {
    void import('eruda').then(({ default: eruda }) => eruda.init());
}

async function enableMocking() {
    const host = document.baseURI.replace(/\/$/, '');

    return new Promise(async resolve => {
        const { worker } = await import('./server/worker');

        const startMockWorker = () =>
            worker.start({
                onUnhandledRequest: 'bypass',
                quiet: false,
                serviceWorker: {
                    url: `${import.meta.env.VITE_GH_PAGES ? '/demo-dapp-with-react-ui' : ''}/mockServiceWorker.js`
                }
            });
        let serviceWorkerRegistration: ServiceWorkerRegistration | null | void =
            await startMockWorker();
        resolve(serviceWorkerRegistration);

        const verifyAndRestartWorker = runSingleInstance(async () => {
            try {
                const serviceWorkerRegistrations =
                    (await navigator.serviceWorker?.getRegistrations()) || [];

                const isServiceWorkerOk = serviceWorkerRegistrations.length > 0;
                const isApiOk = await fetch(`${host}/api/healthz`)
                    .then(r =>
                        r.status === 200
                            ? r
                                  .json()
                                  .then(p => p.ok)
                                  .catch(() => false)
                            : false
                    )
                    .catch(() => false);

                if (!isServiceWorkerOk || !isApiOk) {
                    await serviceWorkerRegistration?.unregister().catch(() => {});
                    serviceWorkerRegistration = await startMockWorker().catch(() => null);
                }
            } catch (error) {
                console.error('Error in verifyAndRestartWorker:', error);
                serviceWorkerRegistration = await startMockWorker().catch(() => null);
            }
        });

        setInterval(verifyAndRestartWorker, 10_000);
    });
}

enableMocking().then(() => {
    const container = document.getElementById('root') as HTMLElement;
    const root = createRoot(container);
    const app = <App />;
    const isWidgetPreview = window.location.pathname.endsWith('/widget-preview');

    // StrictMode remounts effects and duplicates widget-builder notification previews.
    root.render(isWidgetPreview ? app : <StrictMode>{app}</StrictMode>);
});
