import { useTonConnectUI } from '@tonconnect/ui-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    parseSettingsFromSearchParams,
    toTonConnectOptions,
    toTonConnectResetOptions
} from '../features/dev-settings/utils/settings-url';

type PreviewMode = 'desktop' | 'mobile';

function getInitialPreviewMode(): PreviewMode {
    return new URLSearchParams(window.location.search).get('previewMode') === 'mobile'
        ? 'mobile'
        : 'desktop';
}

export const WidgetModalPreviewPage = () => {
    const [tonConnectUI, setTonConnectOptions] = useTonConnectUI();
    const [previewMode, setPreviewMode] = useState<PreviewMode>(getInitialPreviewMode);
    const lastResetToken = useRef(0);

    useEffect(() => {
        let disposed = false;
        let reopenTimer: number | undefined;

        const notifyReady = () => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (!disposed) {
                        window.parent.postMessage(
                            { type: 'widget-builder-preview-ready' },
                            window.location.origin
                        );
                    }
                });
            });
        };

        const openPreviewModal = () => {
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
    }, [tonConnectUI]);

    useEffect(() => {
        const applySettings = (query: string, resetToken = 0) => {
            if (resetToken > lastResetToken.current) {
                setTonConnectOptions(toTonConnectResetOptions());
                lastResetToken.current = resetToken;
            }

            setTonConnectOptions(
                toTonConnectOptions(parseSettingsFromSearchParams(new URLSearchParams(query)))
            );
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

                if (event.data.previewMode === 'mobile' || event.data.previewMode === 'desktop') {
                    setPreviewMode(event.data.previewMode);
                }
            }
        };

        if (window.location.search) {
            applySettings(window.location.search);
        }

        window.addEventListener('message', onMessage);

        return () => window.removeEventListener('message', onMessage);
    }, [setTonConnectOptions]);

    const previewStyles = useMemo(
        () =>
            previewMode === 'desktop'
                ? `
                    [data-tc-modal='true'] {
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        background: transparent !important;
                        padding: 4px !important;
                        overflow: hidden !important;
                        box-sizing: border-box !important;
                    }

                    [data-tc-modal='true'] > div {
                        width: fit-content !important;
                        height: auto !important;
                        max-height: 100% !important;
                        margin: 0 !important;
                        overflow: hidden !important;
                        flex-shrink: 0;
                        transform: scale(0.92) !important;
                        transform-origin: center center !important;
                    }
                `
                : `
                    [data-tc-modal='true'] {
                        background: transparent !important;
                        padding: 0 !important;
                        overflow: hidden !important;
                    }

                    [data-tc-modal='true'] > div {
                        width: 100% !important;
                        max-height: 100% !important;
                        margin: auto 0 0 0 !important;
                        overflow: hidden !important;
                    }
                `,
        [previewMode]
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
                <div className="sr-only">TON Connect modal preview</div>
            </main>
        </>
    );
};
