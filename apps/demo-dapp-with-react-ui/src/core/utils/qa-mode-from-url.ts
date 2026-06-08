import { enableQaMode } from '@tonconnect/ui-react';

export const QA_MODE_URL_PARAM = 'qa';

const DEMO_QA_COMPENSATION_STYLE_ID = 'demo-qa-compensation-styles';

/** Matches `@tonconnect/sdk` QA banner offset (`body.qa-mode-active { padding-top: 48px }`). */
const QA_BANNER_HEIGHT_PX = 48;

const QA_MODE_ENABLED_VALUES = new Set(['1', 'true', 'enable']);

export function isQaModeEnabledViaUrl(search?: string): boolean {
    const query = search ?? (typeof window !== 'undefined' ? window.location.search : '');
    const value = new URLSearchParams(query).get(QA_MODE_URL_PARAM);
    return value !== null && QA_MODE_ENABLED_VALUES.has(value);
}

/** In QA mode only malformed JSON blocks wallet requests; semantic errors stay visible. */
export function blocksWalletSend(
    isInvalid: boolean,
    isSyntaxInvalid: boolean,
    qaMode: boolean
): boolean {
    return qaMode ? isSyntaxInvalid : isInvalid;
}

/** Enables SDK QA mode from `?qa=1` and applies demo layout compensation for the fixed banner. */
export function initQaModeFromUrl(): void {
    if (!isQaModeEnabledViaUrl()) {
        return;
    }

    enableQaMode();
    scheduleDemoQaCompensationStyles();
}

function scheduleDemoQaCompensationStyles(): void {
    if (typeof document === 'undefined') {
        return;
    }

    const inject = () => {
        if (document.getElementById(DEMO_QA_COMPENSATION_STYLE_ID)) {
            return;
        }

        const style = document.createElement('style');
        style.id = DEMO_QA_COMPENSATION_STYLE_ID;
        // SDK already adds body padding-top for the fixed banner; drop duplicate margin on app bar.
        style.textContent = `
            body.qa-mode-active {
                --demo-qa-banner-height: ${QA_BANNER_HEIGHT_PX}px;
            }

            body.qa-mode-active header[data-app-chrome-header] {
                margin-top: 0 !important;
            }

            body.qa-mode-active [data-slot="sidebar-wrapper"] {
                min-height: calc(100svh - var(--demo-qa-banner-height)) !important;
            }

            body.qa-mode-active [data-slot="sidebar"] {
                top: var(--demo-qa-banner-height) !important;
                height: calc(100svh - var(--demo-qa-banner-height)) !important;
                max-height: calc(100svh - var(--demo-qa-banner-height)) !important;
            }

            body.qa-mode-active [data-slot="sidebar-content"] {
                overflow-y: hidden !important;
            }
        `;
        const sdkStyles = document.getElementById('ton-connect-qa-mode-styles');
        if (sdkStyles) {
            sdkStyles.after(style);
        } else {
            document.head.appendChild(style);
        }
    };

    inject();
    requestAnimationFrame(inject);
}
