let qaModeEnabled = false;
let bannerObserver: MutationObserver | null = null;

export function enableQaMode(): void {
    qaModeEnabled = true;
    console.warn('🚨 QA Mode enabled - validation is disabled. This is unsafe for production!');
    showQaModeBanner();
    startBannerObserver();
    addQaModeStyles();
}

export function isQaModeEnabled(): boolean {
    return qaModeEnabled;
}

export function logValidationError(message: string): void {
    if (isQaModeEnabled()) {
        console.error(`[QA Mode] Validation failed: ${message}`);
    }
}

function showQaModeBanner(): void {
    if (typeof window === 'undefined') return;

    const existingBanner = document.getElementById('ton-connect-qa-banner');
    if (existingBanner) return;

    const banner = document.createElement('div');
    banner.id = 'ton-connect-qa-banner';
    banner.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: linear-gradient(90deg, #ff6b6b, #ff8e8e);
        color: white;
        padding: 12px 20px;
        text-align: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-weight: 600;
        font-size: 14px;
        z-index: 999999;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        animation: slideDown 0.3s ease-out;
        user-select: none;
        pointer-events: none;
    `;

    banner.innerHTML = `
        🚨 QA Mode Active - Validation Disabled (Unsafe for Production)
    `;

    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from { transform: translateY(-100%); }
            to { transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(banner);
    addQaModeStyles();
}

function addQaModeStyles(): void {
    if (typeof window === 'undefined') return;

    const existingStyle = document.getElementById('ton-connect-qa-mode-styles');
    if (existingStyle) return;

    const style = document.createElement('style');
    style.id = 'ton-connect-qa-mode-styles';
    style.textContent = `
        body.qa-mode-active {
            padding-top: 48px !important;
        }
        
        body.qa-mode-active header {
            margin-top: 48px !important;
        }
        
        body.qa-mode-active .qa-mode-control {
            top: 128px !important;
        }
    `;

    document.head.appendChild(style);
    document.body.classList.add('qa-mode-active');
}

function startBannerObserver(): void {
    if (typeof window === 'undefined' || bannerObserver) return;

    bannerObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.removedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const element = node as Element;
                        if (element.id === 'ton-connect-qa-banner' && qaModeEnabled) {
                            console.warn('QA Mode banner was removed, restoring...');
                            setTimeout(() => showQaModeBanner(), 100);
                        } else if (element.id === 'ton-connect-qa-mode-styles' && qaModeEnabled) {
                            console.warn('QA Mode styles were removed, restoring...');
                            setTimeout(() => addQaModeStyles(), 100);
                        }
                    }
                });
            }
        });
    });

    bannerObserver.observe(document.body, {
        childList: true,
        subtree: false
    });

    bannerObserver.observe(document.head, {
        childList: true,
        subtree: false
    });
} 