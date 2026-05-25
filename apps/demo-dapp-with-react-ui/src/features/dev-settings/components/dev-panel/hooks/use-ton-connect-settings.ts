import { useTonConnectUI } from '@tonconnect/ui-react';
import { useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
    clearSettingsSearchParams,
    parseSettingsFromSearchParams,
    SETTINGS_PARAM_KEYS,
    type TonConnectSettingsState,
    toTonConnectOptions,
    toTonConnectResetOptions,
    writeSettingsToSearchParams
} from '../../../utils/settings-url';

function hasSettingsInUrl(params: URLSearchParams): boolean {
    return SETTINGS_PARAM_KEYS.some(key => params.has(key));
}

export function useTonConnectSettings() {
    const [searchParams, setSearchParams] = useSearchParams();

    const settings = useMemo(() => parseSettingsFromSearchParams(searchParams), [searchParams]);

    const setSettings = useCallback(
        (
            patch:
                | Partial<TonConnectSettingsState>
                | ((prev: TonConnectSettingsState) => TonConnectSettingsState)
        ) => {
            setSearchParams(
                prev => {
                    const current = parseSettingsFromSearchParams(prev);
                    const next =
                        typeof patch === 'function' ? patch(current) : { ...current, ...patch };
                    const analyticsChanged = next.analyticsEnabled !== current.analyticsEnabled;

                    if (analyticsChanged && typeof window !== 'undefined') {
                        // Analytics mode is fixed at TonConnect init — reload after URL update.
                        const record = writeSettingsToSearchParams(
                            new URLSearchParams(window.location.search),
                            next
                        );
                        const search = new URLSearchParams(record).toString();
                        window.location.assign(
                            `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`
                        );
                        return record;
                    }

                    return writeSettingsToSearchParams(prev, next);
                },
                { replace: true }
            );
        },
        [setSearchParams]
    );

    const resetSettings = useCallback(() => {
        const hadAnalyticsOff = searchParams.get('analytics') === '0';
        setSearchParams(prev => clearSettingsSearchParams(prev), { replace: true });
        if (hadAnalyticsOff && typeof window !== 'undefined') {
            window.location.reload();
        }
    }, [searchParams, setSearchParams]);

    return { settings, setSettings, resetSettings };
}

export function useApplyTonConnectSettings(settings: TonConnectSettingsState) {
    const [searchParams] = useSearchParams();
    const [, setOptions] = useTonConnectUI();

    useEffect(() => {
        if (hasSettingsInUrl(searchParams)) {
            setOptions(toTonConnectOptions(settings));
        } else {
            setOptions(toTonConnectResetOptions());
        }
    }, [searchParams, settings, setOptions]);
}
