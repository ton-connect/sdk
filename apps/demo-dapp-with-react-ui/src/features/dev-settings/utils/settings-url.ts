import type { BorderRadius, ColorsSet, Locales, ReturnStrategy, Theme } from '@tonconnect/ui-react';
import { THEME } from '@tonconnect/ui-react';

import { DEFAULT_COLORS_SET } from './default-colors';
import {
    parseWalletFeaturesPresets,
    serializeWalletFeaturesPresets,
    type WalletFeaturesPresetId,
    walletFeaturesPresetsToRequiredFeatures
} from './wallet-features-presets';

export type ActionTrigger = 'before' | 'success' | 'error';
export type SkipRedirect = 'ios' | 'never' | 'always';

export interface TonConnectSettingsState {
    language: Locales;
    theme: Theme | 'SYSTEM';
    borderRadius: BorderRadius;
    enableAndroidBackHandler: boolean;
    returnStrategy: string;
    /** Empty = not set. Must include `://` when set. */
    twaReturnUrl: string;
    skipRedirect: SkipRedirect;
    walletsRequiredPresets: WalletFeaturesPresetId[];
    walletsPreferredPresets: WalletFeaturesPresetId[];
    modals: ActionTrigger[];
    notifications: ActionTrigger[];
    /** When false, TonConnect SDK analytics mode is `off`. */
    analyticsEnabled: boolean;
    colorsSet?: Partial<Record<Theme, ColorsSet>>;
}

export const DEFAULT_TON_CONNECT_SETTINGS: TonConnectSettingsState = {
    language: 'en',
    theme: THEME.DARK,
    borderRadius: 'm',
    enableAndroidBackHandler: true,
    returnStrategy: 'back',
    twaReturnUrl: '',
    skipRedirect: 'ios',
    walletsRequiredPresets: [],
    walletsPreferredPresets: [],
    modals: ['before'],
    notifications: ['before', 'success', 'error'],
    analyticsEnabled: true
};

export const CHAIN_PARAM_KEY = 'chain';

export const SETTINGS_PARAM_KEYS = [
    'lang',
    'theme',
    'radius',
    'android',
    'return',
    'twa',
    'skip',
    'req',
    'pref',
    'modals',
    'notifications',
    'analytics',
    'colors'
] as const;

const ACTION_TRIGGERS: ActionTrigger[] = ['before', 'success', 'error'];
const LANG_VALUES: Locales[] = ['en', 'ru'];
const THEME_VALUES = [THEME.DARK, THEME.LIGHT, 'SYSTEM'] as const;
const RADIUS_VALUES: BorderRadius[] = ['m', 's', 'none'];
const SKIP_VALUES: SkipRedirect[] = ['ios', 'never', 'always'];

function parseActionList(value: string | null, fallback: ActionTrigger[]): ActionTrigger[] {
    // Missing param → defaults; explicit empty (`notifications=`) → none selected.
    if (value === null) {
        return fallback;
    }
    if (value === '') {
        return [];
    }
    return value
        .split(',')
        .map(item => item.trim())
        .filter((item): item is ActionTrigger => ACTION_TRIGGERS.includes(item as ActionTrigger));
}

function serializeActionList(items: ActionTrigger[]): string {
    return items.join(',');
}

function encodeColors(colorsSet: Partial<Record<Theme, ColorsSet>>): string {
    return btoa(unescape(encodeURIComponent(JSON.stringify(colorsSet))));
}

function decodeColors(value: string | null): Partial<Record<Theme, ColorsSet>> | undefined {
    if (!value) {
        return undefined;
    }
    try {
        return JSON.parse(decodeURIComponent(escape(atob(value)))) as Partial<
            Record<Theme, ColorsSet>
        >;
    } catch {
        return undefined;
    }
}

function pickEnum<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
    if (value && (allowed as readonly string[]).includes(value)) {
        return value as T;
    }
    return fallback;
}

export function parseSettingsFromSearchParams(params: URLSearchParams): TonConnectSettingsState {
    const defaults = DEFAULT_TON_CONNECT_SETTINGS;

    return {
        language: pickEnum(params.get('lang'), LANG_VALUES, defaults.language),
        theme: pickEnum(params.get('theme'), THEME_VALUES, defaults.theme),
        borderRadius: pickEnum(params.get('radius'), RADIUS_VALUES, defaults.borderRadius),
        enableAndroidBackHandler: params.has('android')
            ? params.get('android') !== '0'
            : defaults.enableAndroidBackHandler,
        returnStrategy: params.get('return')?.trim() || defaults.returnStrategy,
        twaReturnUrl: params.get('twa')?.trim() || defaults.twaReturnUrl,
        skipRedirect: pickEnum(params.get('skip'), SKIP_VALUES, defaults.skipRedirect),
        walletsRequiredPresets: parseWalletFeaturesPresets(params.get('req')),
        walletsPreferredPresets: parseWalletFeaturesPresets(params.get('pref')),
        modals: parseActionList(params.get('modals'), defaults.modals),
        notifications: parseActionList(params.get('notifications'), defaults.notifications),
        analyticsEnabled: params.get('analytics') !== '0',
        colorsSet: decodeColors(params.get('colors'))
    };
}

export function serializeSettingsToParams(
    settings: TonConnectSettingsState
): Record<string, string> {
    const params: Record<string, string> = {
        lang: settings.language,
        theme: settings.theme,
        radius: settings.borderRadius,
        android: settings.enableAndroidBackHandler ? '1' : '0',
        return: settings.returnStrategy,
        ...(settings.twaReturnUrl.includes('://') ? { twa: settings.twaReturnUrl } : {}),
        skip: settings.skipRedirect,
        ...(settings.walletsRequiredPresets.length > 0
            ? { req: serializeWalletFeaturesPresets(settings.walletsRequiredPresets) }
            : {}),
        ...(settings.walletsPreferredPresets.length > 0
            ? { pref: serializeWalletFeaturesPresets(settings.walletsPreferredPresets) }
            : {}),
        modals: serializeActionList(settings.modals),
        notifications: serializeActionList(settings.notifications),
        analytics: settings.analyticsEnabled ? '1' : '0'
    };

    if (settings.colorsSet && Object.keys(settings.colorsSet).length > 0) {
        params.colors = encodeColors(settings.colorsSet);
    }

    return params;
}

function searchParamsToRecord(params: URLSearchParams): Record<string, string> {
    return Object.fromEntries(params.entries());
}

export function writeSettingsToSearchParams(
    current: URLSearchParams,
    settings: TonConnectSettingsState
): Record<string, string> {
    const next = new URLSearchParams(current);

    for (const key of SETTINGS_PARAM_KEYS) {
        next.delete(key);
    }

    for (const [key, value] of Object.entries(serializeSettingsToParams(settings))) {
        next.set(key, value);
    }

    return searchParamsToRecord(next);
}

export function clearSettingsSearchParams(current: URLSearchParams): Record<string, string> {
    const next = new URLSearchParams(current);

    for (const key of SETTINGS_PARAM_KEYS) {
        next.delete(key);
    }

    next.delete(CHAIN_PARAM_KEY);

    return searchParamsToRecord(next);
}

function buildActionsConfiguration(settings: TonConnectSettingsState) {
    return {
        modals: settings.modals,
        notifications: settings.notifications,
        returnStrategy: settings.returnStrategy as ReturnStrategy,
        skipRedirectToWallet: settings.skipRedirect,
        ...(settings.twaReturnUrl.includes('://')
            ? { twaReturnUrl: settings.twaReturnUrl as `${string}://${string}` }
            : {})
    };
}

export function toTonConnectOptions(settings: TonConnectSettingsState) {
    return {
        language: settings.language,
        uiPreferences: {
            theme: settings.theme as Theme,
            borderRadius: settings.borderRadius,
            ...(settings.colorsSet ? { colorsSet: settings.colorsSet } : {})
        },
        actionsConfiguration: buildActionsConfiguration(settings),
        walletsRequiredFeatures: walletFeaturesPresetsToRequiredFeatures(
            settings.walletsRequiredPresets
        ),
        walletsPreferredFeatures: walletFeaturesPresetsToRequiredFeatures(
            settings.walletsPreferredPresets
        ),
        enableAndroidBackHandler: settings.enableAndroidBackHandler
    };
}

/** Full TonConnect UI options applied on reset (includes default palettes). */
export function getProviderAnalyticsSettings(settings: TonConnectSettingsState) {
    return {
        mode: settings.analyticsEnabled ? ('telemetry' as const) : ('off' as const)
    };
}

export function getProviderAnalyticsSettingsFromLocation(search?: string) {
    const query = search ?? (typeof window !== 'undefined' ? window.location.search : '');
    return getProviderAnalyticsSettings(parseSettingsFromSearchParams(new URLSearchParams(query)));
}

export function toTonConnectResetOptions() {
    const settings = DEFAULT_TON_CONNECT_SETTINGS;

    return {
        language: settings.language,
        uiPreferences: {
            theme: settings.theme as Theme,
            borderRadius: settings.borderRadius,
            colorsSet: DEFAULT_COLORS_SET
        },
        actionsConfiguration: buildActionsConfiguration(settings),
        walletsRequiredFeatures: undefined,
        walletsPreferredFeatures: undefined,
        enableAndroidBackHandler: settings.enableAndroidBackHandler
    };
}
