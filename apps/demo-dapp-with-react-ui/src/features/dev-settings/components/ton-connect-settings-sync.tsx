import {
    useApplyTonConnectSettings,
    useTonConnectSettings
} from '../hooks/use-ton-connect-settings';

/** Applies TonConnect UI options from URL search params on every route. */
export const TonConnectSettingsSync = () => {
    const { settings } = useTonConnectSettings();
    useApplyTonConnectSettings(settings);
    return null;
};
