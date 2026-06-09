export type PreviewKind = 'connect' | 'action';
export type PreviewMode = 'desktop' | 'mobile';
export type PreviewMethod = 'sendTransaction' | 'signData' | 'signMessage';
export type PreviewSurface = 'modal' | 'notification';
export type PreviewTrigger = 'before' | 'success' | 'error';

export type PreviewBlockType =
    | 'launcher'
    | 'desktopModal'
    | 'mobileModal'
    | 'actionModal'
    | 'actionNotification';

export type ActionPreviewBlockType = 'actionModal' | 'actionNotification';

export interface ActionBlockFields {
    method: PreviewMethod;
    trigger: PreviewTrigger;
    previewMode: PreviewMode;
}

export interface PreviewFrameSize {
    width: number;
    height: number;
}

const DESKTOP_MODAL_SIZE: PreviewFrameSize = { width: 500, height: 720 };
const MOBILE_MODAL_SIZE: PreviewFrameSize = { width: 380, height: 580 };
const ACTION_CONFIRM_MODAL_SIZE_DESKTOP: PreviewFrameSize = { width: 500, height: 440 };
const ACTION_RESULT_MODAL_SIZE_DESKTOP: PreviewFrameSize = { width: 500, height: 300 };
const ACTION_CONFIRM_MODAL_SIZE_MOBILE: PreviewFrameSize = { width: 380, height: 400 };
const ACTION_RESULT_MODAL_SIZE_MOBILE: PreviewFrameSize = { width: 380, height: 280 };
const NOTIFICATION_SIZE: PreviewFrameSize = { width: 280, height: 140 };

/** Matches `useOpenedNotifications` default timeout in @tonconnect/ui. */
export const NOTIFICATION_AUTO_DISMISS_MS = 4500;

/** Matches exit transition duration in notifications/index.tsx. */
export const NOTIFICATION_EXIT_ANIMATION_MS = 200;

/**
 * Refresh the preview toast shortly before SDK auto-dismiss (before exit animation).
 * Buffer covers async preview apply latency so the replacement is visible in time.
 */
/** Time to apply the next toast before SDK removes the previous one. */
export const PREVIEW_NOTIFICATION_REFRESH_BUFFER_MS = 300;

export const PREVIEW_NOTIFICATION_KEEPALIVE_MS =
    NOTIFICATION_AUTO_DISMISS_MS - PREVIEW_NOTIFICATION_REFRESH_BUFFER_MS;

export const PREVIEW_BLOCK_TYPES = new Set<PreviewBlockType>([
    'launcher',
    'desktopModal',
    'mobileModal',
    'actionModal',
    'actionNotification'
]);

export const PREVIEW_METHODS = new Set<PreviewMethod>([
    'sendTransaction',
    'signData',
    'signMessage'
]);

export const PREVIEW_TRIGGERS = new Set<PreviewTrigger>(['before', 'success', 'error']);

export const PREVIEW_MODES = new Set<PreviewMode>(['desktop', 'mobile']);

export function isActionBlockType(type: PreviewBlockType): type is ActionPreviewBlockType {
    return type === 'actionModal' || type === 'actionNotification';
}

export function getPreviewFrameSize(
    type: PreviewBlockType,
    previewMode: PreviewMode = 'desktop',
    trigger: PreviewTrigger = 'before'
): PreviewFrameSize {
    if (type === 'actionNotification') {
        return NOTIFICATION_SIZE;
    }

    if (type === 'actionModal') {
        const isResultModal = trigger === 'success' || trigger === 'error';

        if (previewMode === 'mobile') {
            return isResultModal
                ? ACTION_RESULT_MODAL_SIZE_MOBILE
                : ACTION_CONFIRM_MODAL_SIZE_MOBILE;
        }

        return isResultModal ? ACTION_RESULT_MODAL_SIZE_DESKTOP : ACTION_CONFIRM_MODAL_SIZE_DESKTOP;
    }

    if (type === 'mobileModal') {
        return MOBILE_MODAL_SIZE;
    }

    if (type === 'desktopModal') {
        return DESKTOP_MODAL_SIZE;
    }

    return { width: 220, height: 112 };
}

export function getPreviewKind(type: PreviewBlockType): PreviewKind {
    return isActionBlockType(type) ? 'action' : 'connect';
}

export function getPreviewSurface(type: PreviewBlockType): PreviewSurface | null {
    if (type === 'actionModal') {
        return 'modal';
    }

    if (type === 'actionNotification') {
        return 'notification';
    }

    return null;
}

export function getConnectPreviewMode(type: PreviewBlockType): PreviewMode {
    return type === 'mobileModal' ? 'mobile' : 'desktop';
}

const ACTION_MODAL_READY_SELECTORS: Record<PreviewMethod, Record<PreviewTrigger, string>> = {
    sendTransaction: {
        before: '[data-tc-confirm-modal="true"]',
        success: '[data-tc-transaction-sent-modal="true"]',
        error: '[data-tc-transaction-canceled-modal="true"]'
    },
    signData: {
        before: '[data-tc-sign-data-confirm-modal="true"]',
        success: '[data-tc-data-signed-modal="true"]',
        error: '[data-tc-sign-data-canceled-modal="true"]'
    },
    signMessage: {
        before: '[data-tc-sign-message-confirm-modal="true"]',
        success: '[data-tc-message-signed-modal="true"]',
        error: '[data-tc-sign-message-canceled-modal="true"]'
    }
};

const ACTION_NOTIFICATION_READY_SELECTORS: Record<PreviewMethod, Record<PreviewTrigger, string>> = {
    sendTransaction: {
        before: '[data-tc-notification-confirm-transaction="true"]',
        success: '[data-tc-notification-tx-sent="true"]',
        error: '[data-tc-notification-tx-cancelled="true"]'
    },
    signData: {
        before: '[data-tc-notification-confirm-sign-data="true"]',
        success: '[data-tc-notification-data-signed="true"]',
        error: '[data-tc-notification-sign-data-cancelled="true"]'
    },
    signMessage: {
        before: '[data-tc-notification-confirm-sign-message="true"]',
        success: '[data-tc-notification-message-signed="true"]',
        error: '[data-tc-notification-sign-message-cancelled="true"]'
    }
};

export function getActionPreviewReadySelector(
    method: PreviewMethod,
    surface: PreviewSurface,
    trigger: PreviewTrigger
): string {
    const selectors =
        surface === 'notification'
            ? ACTION_NOTIFICATION_READY_SELECTORS
            : ACTION_MODAL_READY_SELECTORS;

    return selectors[method][trigger];
}

export function getPreviewReadySelector(
    previewKind: PreviewKind,
    previewSurface: PreviewSurface | null,
    method?: PreviewMethod,
    trigger?: PreviewTrigger
): string {
    if (previewKind === 'connect') {
        return '[data-tc-modal="true"]';
    }

    if (previewSurface === 'notification' && method && trigger) {
        return getActionPreviewReadySelector(method, previewSurface, trigger);
    }

    if (previewSurface === 'modal' && method && trigger) {
        return getActionPreviewReadySelector(method, previewSurface, trigger);
    }

    return previewSurface === 'notification'
        ? '[data-tc-notification="true"]'
        : '[data-tc-actions-modal-container="true"]';
}

export const PREVIEW_BLOCK_LABELS: Record<PreviewBlockType, string> = {
    launcher: 'Button',
    desktopModal: 'Desktop modal',
    mobileModal: 'Mobile modal',
    actionModal: 'Action modal',
    actionNotification: 'Action notification'
};

export const PREVIEW_BLOCK_SHORT_LABELS: Record<PreviewBlockType, string> = {
    launcher: 'Button',
    desktopModal: 'Desktop',
    mobileModal: 'Mobile',
    actionModal: 'Modal',
    actionNotification: 'Toast'
};

export const PREVIEW_METHODS_LIST: PreviewMethod[] = ['sendTransaction', 'signData', 'signMessage'];

export const PREVIEW_TRIGGERS_LIST: PreviewTrigger[] = ['before', 'success', 'error'];

export const PREVIEW_METHOD_LABELS: Record<PreviewMethod, string> = {
    sendTransaction: 'Send tx',
    signData: 'Sign data',
    signMessage: 'Sign message'
};

export const PREVIEW_TRIGGER_LABELS: Record<PreviewTrigger, string> = {
    before: 'Before',
    success: 'Success',
    error: 'Error'
};

export const PREVIEW_SURFACE_LABELS: Record<PreviewSurface, string> = {
    modal: 'Modal',
    notification: 'Notification'
};

export interface AddPreviewBlockOption {
    value: string;
    label: string;
}

export interface AddPreviewBlockGroup {
    label: string;
    options: AddPreviewBlockOption[];
}

export function encodeAddBlockOption(
    type: PreviewBlockType,
    method?: PreviewMethod,
    trigger?: PreviewTrigger
): string {
    if (isActionBlockType(type)) {
        return `${type}:${method ?? 'sendTransaction'}:${trigger ?? 'before'}`;
    }

    return type;
}

export function decodeAddBlockOption(value: string): {
    type: PreviewBlockType;
    method?: PreviewMethod;
    trigger?: PreviewTrigger;
} | null {
    if (!value) {
        return null;
    }

    const parts = value.split(':');

    if (parts.length === 3) {
        const [type, method, trigger] = parts as [
            ActionPreviewBlockType,
            PreviewMethod,
            PreviewTrigger
        ];

        if (
            !isActionBlockType(type) ||
            !PREVIEW_METHODS.has(method) ||
            !PREVIEW_TRIGGERS.has(trigger)
        ) {
            return null;
        }

        return { type, method, trigger };
    }

    if (parts.length === 1 && PREVIEW_BLOCK_TYPES.has(parts[0] as PreviewBlockType)) {
        return { type: parts[0] as PreviewBlockType };
    }

    return null;
}

export function getActionPreviewBlockLabel(
    surface: PreviewSurface,
    method: PreviewMethod,
    trigger: PreviewTrigger
): string {
    return `${PREVIEW_METHOD_LABELS[method]} · ${PREVIEW_SURFACE_LABELS[surface]} · ${PREVIEW_TRIGGER_LABELS[trigger]}`;
}

export function getPreviewBlockTitle(block: {
    type: PreviewBlockType;
    method?: PreviewMethod;
    trigger?: PreviewTrigger;
    previewMode?: PreviewMode;
}): string {
    if (isActionBlockType(block.type) && block.method && block.trigger) {
        return getActionPreviewBlockLabel(
            getPreviewSurface(block.type)!,
            block.method,
            block.trigger
        );
    }

    return PREVIEW_BLOCK_LABELS[block.type];
}

export const ADD_PREVIEW_BLOCK_GROUPS: AddPreviewBlockGroup[] = [
    {
        label: 'Connect wallet',
        options: [
            { value: 'launcher', label: PREVIEW_BLOCK_LABELS.launcher },
            { value: 'desktopModal', label: PREVIEW_BLOCK_LABELS.desktopModal },
            { value: 'mobileModal', label: PREVIEW_BLOCK_LABELS.mobileModal }
        ]
    },
    ...PREVIEW_METHODS_LIST.map(method => ({
        label: PREVIEW_METHOD_LABELS[method],
        options: PREVIEW_TRIGGERS_LIST.flatMap(trigger => [
            {
                value: encodeAddBlockOption('actionModal', method, trigger),
                label: `${PREVIEW_SURFACE_LABELS.modal} · ${PREVIEW_TRIGGER_LABELS[trigger]}`
            },
            {
                value: encodeAddBlockOption('actionNotification', method, trigger),
                label: `${PREVIEW_SURFACE_LABELS.notification} · ${PREVIEW_TRIGGER_LABELS[trigger]}`
            }
        ])
    }))
];

export const PREVIEW_BLOCK_EXPORT_SLUGS: Record<PreviewBlockType, string> = {
    launcher: 'launcher',
    desktopModal: 'desktop-modal',
    mobileModal: 'mobile-modal',
    actionModal: 'action-modal',
    actionNotification: 'action-notification'
};
