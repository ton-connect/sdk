import { useTonConnectUI } from '@tonconnect/ui-react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
    parseSettingsFromSearchParams,
    toTonConnectOptions,
    toTonConnectResetOptions
} from '../features/dev-settings/utils/settings-url';
import { applyPreviewAction } from '../features/widget-builder/utils/preview-action';
import {
    clearPreviewConnectedWallet,
    installPreviewMocks,
    setPreviewConnectedWallet
} from '../features/widget-builder/utils/preview-mocks';
import { parseButtonPreviewCss } from '../features/widget-builder/utils/button-preview-css';
import { clearAllPreviewNotifications } from '../features/widget-builder/utils/preview-use-notifications';
import {
    getActionPreviewReadySelector,
    PREVIEW_CONNECT_BUTTON_SELECTOR,
    type PreviewKind,
    type PreviewMethod,
    type PreviewMode,
    type PreviewSurface,
    type PreviewTrigger
} from '../features/widget-builder/utils/preview-types';

const PREVIEW_BUTTON_ROOT_ID = 'widget-preview-button-root';

function withPreviewSafeOptions(options: ReturnType<typeof toTonConnectOptions>) {
    return {
        ...options,
        actionsConfiguration: {
            ...options.actionsConfiguration,
            returnStrategy: 'none' as const,
            skipRedirectToWallet: 'always' as const
        }
    };
}

function parsePreviewKind(value: string | null): PreviewKind {
    if (value === 'action' || value === 'button') {
        return value;
    }

    return 'connect';
}

function parsePreviewMode(value: string | null): PreviewMode {
    return value === 'mobile' ? 'mobile' : 'desktop';
}

function parsePreviewMethod(value: string | null): PreviewMethod {
    if (value === 'signData' || value === 'signMessage') {
        return value;
    }

    return 'sendTransaction';
}

function parsePreviewSurface(value: string | null): PreviewSurface {
    return value === 'notification' ? 'notification' : 'modal';
}

function parsePreviewTrigger(value: string | null): PreviewTrigger {
    if (value === 'success' || value === 'error') {
        return value;
    }

    return 'before';
}

type PreviewState = ReturnType<typeof getInitialPreviewState>;

function getInitialPreviewState() {
    const params = new URLSearchParams(window.location.search);

    return {
        previewKind: parsePreviewKind(params.get('previewKind')),
        previewMode: parsePreviewMode(params.get('previewMode')),
        previewMethod: parsePreviewMethod(params.get('previewMethod')),
        previewSurface: parsePreviewSurface(params.get('previewSurface')),
        previewTrigger: parsePreviewTrigger(params.get('previewTrigger'))
    };
}

function getPreviewStateSignature(state: PreviewState): string {
    return [
        state.previewKind,
        state.previewMode,
        state.previewMethod,
        state.previewSurface,
        state.previewTrigger
    ].join('|');
}

function getActionPreviewSignature(state: PreviewState): string | null {
    if (state.previewKind !== 'action') {
        return null;
    }

    return `${state.previewMethod}|${state.previewSurface}|${state.previewTrigger}`;
}

function waitForPreviewElement(selector: string, onReady: () => void): () => void {
    if (document.querySelector(selector)) {
        onReady();
        return () => {};
    }

    const observer = new MutationObserver(() => {
        if (document.querySelector(selector)) {
            observer.disconnect();
            onReady();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    const fallbackTimer = window.setTimeout(() => {
        observer.disconnect();
        onReady();
    }, 8000);

    return () => {
        observer.disconnect();
        window.clearTimeout(fallbackTimer);
    };
}

function getNotificationPreviewLayoutStyles(): string {
    return `
        [data-tc-dropdown-container='true'] {
            position: fixed !important;
            inset: 0 !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            transform: none !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            z-index: 1 !important;
            pointer-events: none !important;
        }

        [data-tc-list-notifications='true'] {
            position: relative !important;
            width: auto !important;
            max-width: none !important;
            display: flex !important;
            justify-content: center !important;
            transform: none !important;
            padding: 0 !important;
            overflow: visible !important;
        }

        [data-tc-notification='true'] {
            width: 256px !important;
            max-width: 256px !important;
        }
    `;
}

export const WidgetModalPreviewPage = () => {
    const [tonConnectUI, setTonConnectOptions] = useTonConnectUI();
    const [previewState, setPreviewState] = useState(getInitialPreviewState);
    const [settingsRevision, setSettingsRevision] = useState(0);
    const [buttonPreviewCss, setButtonPreviewCss] = useState(() =>
        parseButtonPreviewCss(new URLSearchParams(window.location.search))
    );
    const lastResetToken = useRef(0);
    const hasAppliedInitialSettingsRef = useRef(false);
    const requestMocksCleanupRef = useRef<(() => void) | null>(null);

    const notifyReady = useCallback(() => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                window.parent.postMessage(
                    { type: 'widget-builder-preview-ready' },
                    window.location.origin
                );
            });
        });
    }, []);

    useEffect(() => {
        // Clicks land inside this iframe and never bubble to the builder page;
        // relay them so the builder can raise the clicked preview block.
        const onPointerDown = () => {
            window.parent.postMessage(
                { type: 'widget-builder-preview-pointerdown' },
                window.location.origin
            );
        };

        window.addEventListener('pointerdown', onPointerDown, true);

        return () => window.removeEventListener('pointerdown', onPointerDown, true);
    }, []);

    useEffect(() => {
        setTonConnectOptions({
            buttonRootId: PREVIEW_BUTTON_ROOT_ID,
            actionsConfiguration: {
                returnStrategy: 'none',
                skipRedirectToWallet: 'always'
            }
        });
    }, [setTonConnectOptions]);

    useLayoutEffect(() => {
        const cleanupMocks = installPreviewMocks(tonConnectUI);

        return () => {
            cleanupMocks();
            requestMocksCleanupRef.current?.();
            requestMocksCleanupRef.current = null;
        };
    }, [tonConnectUI]);

    useLayoutEffect(() => {
        if (previewState.previewKind !== 'action') {
            return;
        }

        setPreviewConnectedWallet(tonConnectUI.connector);
    }, [tonConnectUI, previewState.previewKind]);

    useEffect(() => {
        let disposed = false;
        let reopenTimer: number | undefined;

        if (previewState.previewKind !== 'connect') {
            return;
        }

        const openPreviewModal = () => {
            clearPreviewConnectedWallet(tonConnectUI.connector);

            if (disposed || tonConnectUI.modalState.status === 'opened') {
                notifyReady();
                return;
            }

            void tonConnectUI
                .openModal({ traceId: 'widget-builder-preview' })
                .then(notifyReady)
                .catch(() => {});
        };

        reopenTimer = window.setTimeout(openPreviewModal, 0);

        const unsubscribe = tonConnectUI.onModalStateChange(state => {
            if (state.status === 'opened') {
                notifyReady();
                return;
            }

            if (state.status === 'closed' && !disposed) {
                reopenTimer = window.setTimeout(openPreviewModal, 150);
            }
        });

        return () => {
            disposed = true;

            if (reopenTimer !== undefined) {
                window.clearTimeout(reopenTimer);
            }

            unsubscribe();
        };
    }, [tonConnectUI, previewState.previewKind, notifyReady, settingsRevision]);

    useEffect(() => {
        if (previewState.previewKind !== 'button') {
            return;
        }

        // The real TonConnect button is rendered by @tonconnect/ui into `buttonRootId`;
        // keep the connector disconnected so it shows the "Connect wallet" state.
        clearPreviewConnectedWallet(tonConnectUI.connector);

        return waitForPreviewElement(PREVIEW_CONNECT_BUTTON_SELECTOR, notifyReady);
    }, [tonConnectUI, previewState.previewKind, notifyReady, settingsRevision]);

    const actionPreviewSignature = useMemo(
        () => getActionPreviewSignature(previewState),
        [
            previewState.previewKind,
            previewState.previewMethod,
            previewState.previewSurface,
            previewState.previewTrigger
        ]
    );

    useEffect(() => {
        if (!actionPreviewSignature) {
            return;
        }

        const [method, surface, trigger] = actionPreviewSignature.split('|') as [
            PreviewMethod,
            PreviewSurface,
            PreviewTrigger
        ];

        let disposed = false;
        let readyCleanup: (() => void) | undefined;
        let hasNotifiedReady = false;

        const notifyReadyOnce = () => {
            if (disposed || hasNotifiedReady) {
                return;
            }

            hasNotifiedReady = true;
            notifyReady();
        };

        const readySelector = getActionPreviewReadySelector(method, surface, trigger);

        let previewRunSeq = 0;
        let previewQueue = Promise.resolve();

        const enqueuePreview = (task: () => Promise<void>) => {
            previewQueue = previewQueue.then(task).catch(() => {});
        };

        // Preview toasts never auto-dismiss (see preview-use-notifications.ts), so a single
        // run keeps both modal and notification previews on screen — no keepalive refresh.
        const runPreview = () => {
            const runId = ++previewRunSeq;

            enqueuePreview(async () => {
                if (disposed || runId !== previewRunSeq) {
                    return;
                }

                requestMocksCleanupRef.current?.();
                requestMocksCleanupRef.current = null;

                const cleanup = await applyPreviewAction(tonConnectUI, {
                    method,
                    surface,
                    trigger
                });

                if (disposed || runId !== previewRunSeq) {
                    cleanup();
                    return;
                }

                requestMocksCleanupRef.current = cleanup;
            });
        };

        runPreview();
        readyCleanup = waitForPreviewElement(readySelector, notifyReadyOnce);

        return () => {
            disposed = true;
            previewRunSeq += 1;
            readyCleanup?.();
            requestMocksCleanupRef.current?.();
            requestMocksCleanupRef.current = null;
            clearAllPreviewNotifications();
            void tonConnectUI.disconnect().catch(() => {});
            clearPreviewConnectedWallet(tonConnectUI.connector);
        };
    }, [tonConnectUI, actionPreviewSignature, notifyReady, settingsRevision]);

    useEffect(() => {
        const appliedSettingsQueryRef = { current: '' };
        const appliedPreviewSignatureRef = {
            current: getPreviewStateSignature(getInitialPreviewState())
        };

        const applySettings = (query: string, resetToken = 0) => {
            const shouldReset = resetToken > lastResetToken.current;
            const queryChanged = query !== appliedSettingsQueryRef.current;

            if (!shouldReset && !queryChanged) {
                return;
            }

            if (shouldReset) {
                setTonConnectOptions(toTonConnectResetOptions());
                lastResetToken.current = resetToken;
                appliedSettingsQueryRef.current = '';
            }

            if (query !== appliedSettingsQueryRef.current) {
                appliedSettingsQueryRef.current = query;

                const queryParams = new URLSearchParams(query);

                setButtonPreviewCss(parseButtonPreviewCss(queryParams));
                setTonConnectOptions(
                    withPreviewSafeOptions(
                        toTonConnectOptions(parseSettingsFromSearchParams(queryParams))
                    )
                );
            }

            if (hasAppliedInitialSettingsRef.current) {
                setSettingsRevision(revision => revision + 1);
            }

            hasAppliedInitialSettingsRef.current = true;
        };

        const onMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) {
                return;
            }

            if (
                typeof event.data === 'object' &&
                event.data?.type === 'widget-builder-preview-settings' &&
                typeof event.data.query === 'string'
            ) {
                applySettings(
                    event.data.query,
                    typeof event.data.resetToken === 'number' ? event.data.resetToken : 0
                );

                setPreviewState(current => {
                    const nextPreviewState: PreviewState = {
                        previewKind:
                            event.data.previewKind === 'action' ||
                            event.data.previewKind === 'connect' ||
                            event.data.previewKind === 'button'
                                ? event.data.previewKind
                                : current.previewKind,
                        previewMode:
                            event.data.previewMode === 'mobile' ||
                            event.data.previewMode === 'desktop'
                                ? event.data.previewMode
                                : current.previewMode,
                        previewMethod:
                            event.data.previewMethod === 'sendTransaction' ||
                            event.data.previewMethod === 'signData' ||
                            event.data.previewMethod === 'signMessage'
                                ? event.data.previewMethod
                                : current.previewMethod,
                        previewSurface:
                            event.data.previewSurface === 'modal' ||
                            event.data.previewSurface === 'notification'
                                ? event.data.previewSurface
                                : current.previewSurface,
                        previewTrigger:
                            event.data.previewTrigger === 'before' ||
                            event.data.previewTrigger === 'success' ||
                            event.data.previewTrigger === 'error'
                                ? event.data.previewTrigger
                                : current.previewTrigger
                    };
                    const nextSignature = getPreviewStateSignature(nextPreviewState);

                    if (nextSignature === getPreviewStateSignature(current)) {
                        return current;
                    }

                    appliedPreviewSignatureRef.current = nextSignature;

                    return nextPreviewState;
                });
            }
        };

        if (window.location.search) {
            const initialQuery = window.location.search.startsWith('?')
                ? window.location.search.slice(1)
                : window.location.search;

            applySettings(initialQuery);
        }

        window.addEventListener('message', onMessage);

        return () => window.removeEventListener('message', onMessage);
    }, [setTonConnectOptions]);

    const isNotificationPreview =
        previewState.previewKind === 'action' && previewState.previewSurface === 'notification';
    const isButtonPreview = previewState.previewKind === 'button';

    const previewStyles = useMemo(
        () =>
            isButtonPreview
                ? `
                    #${PREVIEW_BUTTON_ROOT_ID} {
                        position: fixed;
                        inset: 0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-sizing: border-box;
                        /* The preview is display-only: keep the real button from opening the modal. */
                        pointer-events: none;
                    }

                    ${buttonPreviewCss}
                `
                : previewState.previewMode === 'desktop'
                  ? `
                    ${isNotificationPreview ? getNotificationPreviewLayoutStyles() : ''}
                    [data-tc-modal='true'],
                    [data-tc-actions-modal-container='true'] {
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        background: transparent !important;
                        padding: 0 !important;
                        overflow: hidden !important;
                        box-sizing: border-box !important;
                    }

                    [data-tc-modal='true'] > div,
                    [data-tc-actions-modal-container='true'] > div {
                        width: fit-content !important;
                        height: auto !important;
                        max-height: 100% !important;
                        margin: 0 !important;
                        overflow: hidden !important;
                        flex-shrink: 0;
                        transform: none !important;
                        transform-origin: center center !important;
                    }

                    [data-tc-wallets-modal-container='true'] {
                        max-height: 100% !important;
                        overflow-y: auto !important;
                    }

                    [data-tc-list-notifications='true'] {
                        background: transparent !important;
                        padding: 4px !important;
                        overflow: hidden !important;
                    }
                `
                  : `
                    ${isNotificationPreview ? getNotificationPreviewLayoutStyles() : ''}
                    [data-tc-modal='true'],
                    [data-tc-actions-modal-container='true'] {
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        background: transparent !important;
                        padding: 0 !important;
                        overflow: hidden !important;
                    }

                    [data-tc-modal='true'] > div,
                    [data-tc-actions-modal-container='true'] > div {
                        width: 100% !important;
                        max-height: 100% !important;
                        margin: 0 !important;
                        overflow: hidden !important;
                        transform: none !important;
                    }

                    [data-tc-wallets-modal-container='true'] {
                        max-height: 100% !important;
                        overflow-y: auto !important;
                    }

                    [data-tc-list-notifications='true'] {
                        background: transparent !important;
                        padding: 0 !important;
                        overflow: hidden !important;
                    }
                `,
        [isButtonPreview, buttonPreviewCss, isNotificationPreview, previewState.previewMode]
    );

    return (
        <>
            <style>
                {`
                    html,
                    body,
                    #root {
                        background: transparent !important;
                    }

                    body {
                        margin: 0;
                        overflow: hidden;
                    }

                    ${previewStyles}
                `}
            </style>
            <main className="min-h-dvh bg-transparent text-foreground">
                <div
                    id={PREVIEW_BUTTON_ROOT_ID}
                    className={isButtonPreview ? undefined : 'sr-only'}
                />
                <div className="sr-only">TON Connect widget preview</div>
            </main>
        </>
    );
};
