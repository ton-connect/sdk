import { THEME } from '@tonconnect/ui-react';
import { RotateCcw } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/core/components/ui/button';
import { Checkbox } from '@/core/components/ui/checkbox';
import { Input } from '@/core/components/ui/input';
import { Select } from '@/core/components/ui/select';
import { ChevronDownIcon } from '@/core/components/ui/icons';
import { NetworkPicker } from '@/features/network';
import type { ActionTrigger, SkipRedirect } from '../lib/settings-url';
import {
    WALLET_FEATURES_PRESETS,
    type WalletFeaturesPresetId
} from '../lib/wallet-features-presets';
import { useTonConnectSettings } from '../hooks/use-ton-connect-settings';
import { ColorsModal } from './colors-modal';
import { SettingsCard } from './settings-card';

const LANG_OPTIONS = ['en', 'ru'] as const;
const THEME_OPTIONS = [
    { value: THEME.DARK, label: 'Dark' },
    { value: THEME.LIGHT, label: 'Light' },
    { value: 'SYSTEM', label: 'System' }
];
const BORDER_OPTIONS = [
    { value: 'm', label: 'Medium' },
    { value: 's', label: 'Small' },
    { value: 'none', label: 'None' }
];
const SKIP_OPTIONS: { value: SkipRedirect; label: string }[] = [
    { value: 'ios', label: 'iOS only' },
    { value: 'never', label: 'Never' },
    { value: 'always', label: 'Always' }
];
const RETURN_STRATEGY_CUSTOM = '__custom__';
const RETURN_STRATEGY_PRESETS = [
    { value: 'back', label: 'Back' },
    { value: 'none', label: 'None' }
] as const;

function isPresetReturnStrategy(
    value: string
): value is (typeof RETURN_STRATEGY_PRESETS)[number]['value'] {
    return RETURN_STRATEGY_PRESETS.some(preset => preset.value === value);
}

function getReturnStrategySelectValue(strategy: string): string {
    return isPresetReturnStrategy(strategy) ? strategy : RETURN_STRATEGY_CUSTOM;
}

function getReturnStrategyTriggerLabel(strategy: string): string {
    const preset = RETURN_STRATEGY_PRESETS.find(item => item.value === strategy);
    if (preset) {
        return preset.label;
    }
    return strategy.includes('://') ? strategy : 'Custom URL';
}

const ACTION_LABELS: { key: ActionTrigger; label: string }[] = [
    { key: 'before', label: 'Before' },
    { key: 'success', label: 'Success' },
    { key: 'error', label: 'Error' }
];

const FIELD_LABEL = 'text-xs font-medium text-secondary-foreground';
const CHECKBOX_LABEL =
    'flex cursor-pointer items-center gap-2.5 rounded-lg border border-transparent px-2 py-1.5 text-sm text-foreground transition-colors hover:border-tertiary/50 hover:bg-background/40';

/** Aligns select triggers with the compact return-strategy input (size s, py-2). */
const CONTROL_SURFACE_CLASS = '!min-h-11 !px-3 !py-2';
const SELECT_TRIGGER_CLASS = `${CONTROL_SURFACE_CLASS} !justify-between`;
const INPUT_FIELD_CLASS = `${CONTROL_SURFACE_CLASS} items-center !border-transparent !bg-tertiary`;
const INPUT_CONTROL_CLASS =
    '!text-sm !font-semibold !text-foreground placeholder:!font-normal placeholder:!text-secondary-foreground';

const renderTrigger = (label: string) => (
    <Select.Trigger
        variant="gray"
        size="s"
        borderRadius="l"
        fullWidth
        className={SELECT_TRIGGER_CLASS}
    >
        <span className="truncate text-left">{label}</span>
        <ChevronDownIcon size={16} className="shrink-0" />
    </Select.Trigger>
);

const SettingsField = ({ label, children }: { label: string; children: ReactNode }) => (
    <div className="flex w-full min-w-0 flex-col gap-1">
        <span className={FIELD_LABEL}>{label}</span>
        <div className="w-full">{children}</div>
    </div>
);

export const DevPanel = () => {
    const { settings, setSettings, resetSettings } = useTonConnectSettings();
    const returnStrategySelectValue = getReturnStrategySelectValue(settings.returnStrategy);
    const isCustomReturnStrategy = returnStrategySelectValue === RETURN_STRATEGY_CUSTOM;
    const toggleTrigger = (kind: 'modals' | 'notifications', trigger: ActionTrigger) => {
        setSettings(prev => {
            const list = prev[kind];
            const next = list.includes(trigger)
                ? list.filter(item => item !== trigger)
                : [...list, trigger];
            return { ...prev, [kind]: next };
        });
    };

    const commitCustomReturnStrategy = (value: string) => {
        const trimmed = value.trim();
        if (trimmed.includes('://')) {
            setSettings({ returnStrategy: trimmed });
            return;
        }
        setSettings({ returnStrategy: 'back' });
    };

    const commitCustomTwaReturnUrl = (value: string) => {
        const trimmed = value.trim();
        if (trimmed.includes('://')) {
            setSettings({ twaReturnUrl: trimmed });
            return;
        }
        setSettings({ twaReturnUrl: '' });
    };

    const toggleWalletFeaturesPreset = (
        kind: 'walletsRequiredPresets' | 'walletsPreferredPresets',
        presetId: WalletFeaturesPresetId
    ) => {
        setSettings(prev => {
            const list = prev[kind];
            const next = list.includes(presetId)
                ? list.filter(item => item !== presetId)
                : [...list, presetId];
            return { ...prev, [kind]: next };
        });
    };

    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
            <SettingsCard
                title="Appearance"
                description="Language, theme, and border radius passed to TonConnect UI."
            >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <SettingsField label="Language">
                        <Select.Root
                            value={settings.language}
                            onValueChange={language =>
                                setSettings({ language: language as typeof settings.language })
                            }
                        >
                            {renderTrigger(settings.language.toUpperCase())}
                            <Select.Content>
                                {LANG_OPTIONS.map(opt => (
                                    <Select.Item key={opt} value={opt}>
                                        {opt.toUpperCase()}
                                    </Select.Item>
                                ))}
                            </Select.Content>
                        </Select.Root>
                    </SettingsField>

                    <SettingsField label="Theme">
                        <Select.Root
                            value={settings.theme}
                            onValueChange={theme =>
                                setSettings({ theme: theme as typeof settings.theme })
                            }
                        >
                            {renderTrigger(
                                THEME_OPTIONS.find(o => o.value === settings.theme)?.label ??
                                    settings.theme
                            )}
                            <Select.Content>
                                {THEME_OPTIONS.map(opt => (
                                    <Select.Item key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </Select.Item>
                                ))}
                            </Select.Content>
                        </Select.Root>
                    </SettingsField>

                    <SettingsField label="Border radius">
                        <Select.Root
                            value={settings.borderRadius}
                            onValueChange={borderRadius =>
                                setSettings({
                                    borderRadius: borderRadius as typeof settings.borderRadius
                                })
                            }
                        >
                            {renderTrigger(
                                BORDER_OPTIONS.find(o => o.value === settings.borderRadius)
                                    ?.label ?? settings.borderRadius
                            )}
                            <Select.Content>
                                {BORDER_OPTIONS.map(opt => (
                                    <Select.Item key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </Select.Item>
                                ))}
                            </Select.Content>
                        </Select.Root>
                    </SettingsField>
                </div>
            </SettingsCard>

            <SettingsCard
                title="Network"
                description="Preferred chain for new connections. Cannot be changed while a wallet is connected."
            >
                <SettingsField label="Chain">
                    <NetworkPicker triggerClassName={SELECT_TRIGGER_CLASS} />
                </SettingsField>
            </SettingsCard>

            <SettingsCard
                title="Wallet actions"
                description="Return strategy and TWA return URL for Telegram Mini App ↔ TWA wallet flows."
            >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <SettingsField label="Return strategy">
                        <div className="flex flex-col gap-2">
                            <Select.Root
                                value={returnStrategySelectValue}
                                onValueChange={value => {
                                    if (value === RETURN_STRATEGY_CUSTOM) {
                                        setSettings({
                                            returnStrategy: isCustomReturnStrategy
                                                ? settings.returnStrategy
                                                : 'https://'
                                        });
                                        return;
                                    }
                                    setSettings({ returnStrategy: value });
                                }}
                            >
                                {renderTrigger(
                                    getReturnStrategyTriggerLabel(settings.returnStrategy)
                                )}
                                <Select.Content>
                                    {RETURN_STRATEGY_PRESETS.map(opt => (
                                        <Select.Item key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </Select.Item>
                                    ))}
                                    <Select.Item value={RETURN_STRATEGY_CUSTOM}>
                                        Custom URL
                                    </Select.Item>
                                </Select.Content>
                            </Select.Root>
                            {isCustomReturnStrategy ? (
                                <Input size="s">
                                    <Input.Field className={INPUT_FIELD_CLASS}>
                                        <Input.Input
                                            className={INPUT_CONTROL_CLASS}
                                            value={settings.returnStrategy}
                                            onChange={e =>
                                                setSettings({
                                                    returnStrategy: e.target.value
                                                })
                                            }
                                            onBlur={e => commitCustomReturnStrategy(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') {
                                                    commitCustomReturnStrategy(
                                                        e.currentTarget.value
                                                    );
                                                }
                                            }}
                                            placeholder="https://example.com"
                                        />
                                    </Input.Field>
                                </Input>
                            ) : null}
                        </div>
                    </SettingsField>

                    <SettingsField label="TWA return URL">
                        <Input size="s">
                            <Input.Field className={INPUT_FIELD_CLASS}>
                                <Input.Input
                                    className={INPUT_CONTROL_CLASS}
                                    value={settings.twaReturnUrl}
                                    onChange={e => setSettings({ twaReturnUrl: e.target.value })}
                                    onBlur={e => commitCustomTwaReturnUrl(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            commitCustomTwaReturnUrl(e.currentTarget.value);
                                        }
                                    }}
                                    placeholder="https://t.me/…"
                                />
                            </Input.Field>
                        </Input>
                    </SettingsField>

                    <SettingsField label="Skip redirect to wallet">
                        <Select.Root
                            value={settings.skipRedirect}
                            onValueChange={skipRedirect =>
                                setSettings({
                                    skipRedirect: skipRedirect as SkipRedirect
                                })
                            }
                        >
                            {renderTrigger(
                                SKIP_OPTIONS.find(o => o.value === settings.skipRedirect)?.label ??
                                    settings.skipRedirect
                            )}
                            <Select.Content>
                                {SKIP_OPTIONS.map(opt => (
                                    <Select.Item key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </Select.Item>
                                ))}
                            </Select.Content>
                        </Select.Root>
                    </SettingsField>

                    <SettingsField label="Android back handler">
                        <Select.Root
                            value={settings.enableAndroidBackHandler ? 'true' : 'false'}
                            onValueChange={value =>
                                setSettings({ enableAndroidBackHandler: value === 'true' })
                            }
                        >
                            {renderTrigger(
                                settings.enableAndroidBackHandler ? 'Enabled' : 'Disabled'
                            )}
                            <Select.Content>
                                <Select.Item value="true">Enabled</Select.Item>
                                <Select.Item value="false">Disabled</Select.Item>
                            </Select.Content>
                        </Select.Root>
                    </SettingsField>
                </div>
            </SettingsCard>

            <SettingsCard
                title="Wallets list"
                description="Filter or prioritize wallets in the connect modal. Required disables unsupported wallets; preferred moves them to the top."
            >
                <div className="grid gap-6 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-foreground">
                            Required features
                        </span>
                        <div className="flex flex-col gap-0.5">
                            {WALLET_FEATURES_PRESETS.map(({ id, label }) => (
                                <label key={`req-${id}`} className={CHECKBOX_LABEL}>
                                    <Checkbox
                                        checked={settings.walletsRequiredPresets.includes(id)}
                                        onCheckedChange={() =>
                                            toggleWalletFeaturesPreset('walletsRequiredPresets', id)
                                        }
                                    />
                                    {label}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-foreground">
                            Preferred features
                        </span>
                        <div className="flex flex-col gap-0.5">
                            {WALLET_FEATURES_PRESETS.map(({ id, label }) => (
                                <label key={`pref-${id}`} className={CHECKBOX_LABEL}>
                                    <Checkbox
                                        checked={settings.walletsPreferredPresets.includes(id)}
                                        onCheckedChange={() =>
                                            toggleWalletFeaturesPreset(
                                                'walletsPreferredPresets',
                                                id
                                            )
                                        }
                                    />
                                    {label}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </SettingsCard>

            <SettingsCard
                title="Modals & notifications"
                description="Choose when TonConnect UI should show modals and toast notifications during requests."
            >
                <div className="grid gap-6 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-foreground">Modals</span>
                        <div className="flex flex-col gap-0.5">
                            {ACTION_LABELS.map(({ key, label }) => (
                                <label key={key} className={CHECKBOX_LABEL}>
                                    <Checkbox
                                        checked={settings.modals.includes(key)}
                                        onCheckedChange={() => toggleTrigger('modals', key)}
                                    />
                                    {label}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-foreground">Notifications</span>
                        <div className="flex flex-col gap-0.5">
                            {ACTION_LABELS.map(({ key, label }) => (
                                <label key={key} className={CHECKBOX_LABEL}>
                                    <Checkbox
                                        checked={settings.notifications.includes(key)}
                                        onCheckedChange={() => toggleTrigger('notifications', key)}
                                    />
                                    {label}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </SettingsCard>

            <SettingsCard
                title="Analytics"
                description="TonConnect SDK telemetry events. Changing this reloads the page — analytics mode is set at startup."
            >
                <label className={CHECKBOX_LABEL}>
                    <Checkbox
                        checked={settings.analyticsEnabled}
                        onCheckedChange={checked =>
                            setSettings({ analyticsEnabled: checked === true })
                        }
                    />
                    Send analytics (telemetry)
                </label>
            </SettingsCard>

            <SettingsCard
                title="Custom colors"
                description="Override the TonConnect UI palette for light and dark themes. Custom colors are included in the URL."
            >
                <ColorsModal
                    colorsSet={settings.colorsSet}
                    onColorsSetChange={colorsSet => setSettings({ colorsSet })}
                />
            </SettingsCard>

            <Button type="button" variant="ghost" className="self-start" onClick={resetSettings}>
                <RotateCcw size={16} />
                Reset to defaults
            </Button>
        </div>
    );
};
