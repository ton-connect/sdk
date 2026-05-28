import type { ColorsSet, Theme } from '@tonconnect/ui-react';
import { THEME, useTonConnectUI } from '@tonconnect/ui-react';
import { Download, RotateCcw, Settings2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '../../../core/components/ui/button';
import { Checkbox } from '../../../core/components/ui/checkbox';
import { CopyButton } from '../../../core/components/ui/copy-button';
import { Input } from '../../../core/components/ui/input';
import { Select } from '../../../core/components/ui/select';
import { Tabs } from '../../../core/components/ui/tabs';
import { cn } from '../../../core/utils/cn';
import { ColorField } from '../../dev-settings/components/dev-panel/components/color-field';
import { getDefaultColorsForTheme } from '../../dev-settings/utils/default-colors';
import {
    DEFAULT_TON_CONNECT_SETTINGS,
    toTonConnectOptions,
    type TonConnectSettingsState
} from '../../dev-settings/utils/settings-url';
import type { WidgetBuilderSettings } from '../utils/widget-builder-settings';
import { useWidgetBuilderSettings } from '../utils/widget-builder-settings';
import {
    generateCssSnippet,
    generateCustomLauncherSnippet,
    generateJsSnippet,
    generateReactSnippet,
    generateSingleHtmlSnippet
} from '../utils/snippet-generator';

type BuilderTab = 'theme' | 'general' | 'export';
type ExportKind = 'html' | 'css' | 'js' | 'react' | 'launcher';

const TAB_OPTIONS: { value: BuilderTab; label: string }[] = [
    { value: 'theme', label: 'Theme' },
    { value: 'general', label: 'General' },
    { value: 'export', label: 'Export' }
];

const EXPORT_OPTIONS: { value: ExportKind; label: string; description: string }[] = [
    {
        value: 'html',
        label: 'Single HTML',
        description: 'Ready file for a quick no-build check.'
    },
    {
        value: 'css',
        label: 'CSS',
        description: 'Visual overrides for the built-in TON Connect button.'
    },
    {
        value: 'js',
        label: 'JS',
        description: 'CDN initialization for landing pages and website builders.'
    },
    {
        value: 'react',
        label: 'React / NPM',
        description: 'Provider and button snippet for React, Next.js, or Vite.'
    },
    {
        value: 'launcher',
        label: 'Custom launcher',
        description: 'Use your own CTA label and open the TON Connect modal.'
    }
];

const LANGUAGE_OPTIONS = ['en', 'ru'] as const;
const THEME_OPTIONS = [
    { value: THEME.DARK, label: 'Dark' },
    { value: THEME.LIGHT, label: 'Light' },
    { value: 'SYSTEM', label: 'System' }
] as const;
const BORDER_OPTIONS = [
    { value: 'm', label: 'Medium' },
    { value: 's', label: 'Small' },
    { value: 'none', label: 'None' }
] as const;
const RETURN_OPTIONS = [
    { value: 'back', label: 'Back' },
    { value: 'none', label: 'None' }
] as const;
const SKIP_OPTIONS = [
    { value: 'ios', label: 'iOS only' },
    { value: 'never', label: 'Never' },
    { value: 'always', label: 'Always' }
] as const;
const ACTION_LABELS = [
    { value: 'before', label: 'Before' },
    { value: 'success', label: 'Success' },
    { value: 'error', label: 'Error' }
] as const;

function Field({
    label,
    description,
    children
}: {
    label: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-secondary-foreground">
                {label}
            </span>
            {children}
            {description ? (
                <span className="text-xs leading-4 text-tertiary-foreground">{description}</span>
            ) : null}
        </label>
    );
}

function TextField({
    value,
    onChange,
    placeholder,
    type = 'text'
}: {
    value: string | number;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
}) {
    return (
        <Input.Container size="s">
            <Input.Field className="!rounded-xl !border-transparent !bg-tertiary !px-3 !py-2">
                <Input.Input
                    value={value}
                    type={type}
                    placeholder={placeholder}
                    onChange={event => onChange(event.target.value)}
                    className="!text-sm !font-medium"
                />
            </Input.Field>
        </Input.Container>
    );
}

function SelectField({
    value,
    options,
    onChange
}: {
    value: string;
    options: readonly { value: string; label: string }[];
    onChange: (value: string) => void;
}) {
    const label = options.find(option => option.value === value)?.label ?? value;

    return (
        <Select.Root value={value} onValueChange={onChange}>
            <Select.Trigger
                variant="gray"
                size="s"
                borderRadius="l"
                fullWidth
                className="!min-h-10 !justify-between !px-3 !py-2"
            >
                <span className="truncate text-left">{label}</span>
                <span className="text-tertiary-foreground">⌄</span>
            </Select.Trigger>
            <Select.Content>
                {options.map(option => (
                    <Select.Item key={option.value} value={option.value}>
                        {option.label}
                    </Select.Item>
                ))}
            </Select.Content>
        </Select.Root>
    );
}

function ToggleField({
    label,
    description,
    checked,
    onCheckedChange
}: {
    label: string;
    description?: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
}) {
    return (
        <div className="flex items-start gap-3 rounded-xl bg-tertiary/60 p-3">
            <Checkbox
                checked={checked}
                onCheckedChange={value => onCheckedChange(value === true)}
                className="mt-0.5"
            />
            <div className="flex min-w-0 flex-col gap-1">
                <span className="text-sm font-semibold text-foreground">{label}</span>
                {description ? (
                    <span className="text-xs leading-4 text-secondary-foreground">
                        {description}
                    </span>
                ) : null}
            </div>
        </div>
    );
}

function BuilderSection({
    title,
    description,
    children
}: {
    title: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <section className="flex flex-col gap-4 border-t border-tertiary/70 pt-4 first:border-t-0 first:pt-0">
            <div className="flex flex-col gap-1">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">
                    {title}
                </h2>
                {description ? (
                    <p className="text-xs leading-5 text-secondary-foreground">{description}</p>
                ) : null}
            </div>
            {children}
        </section>
    );
}

function getPreviewColors(tonSettings: TonConnectSettingsState) {
    const theme = tonSettings.theme === THEME.LIGHT ? THEME.LIGHT : THEME.DARK;
    const defaults = getDefaultColorsForTheme(theme);
    return tonSettings.colorsSet?.[theme] ?? defaults;
}

function getThemeForPreview(tonSettings: TonConnectSettingsState): Theme {
    return tonSettings.theme === THEME.LIGHT ? THEME.LIGHT : THEME.DARK;
}

function getRadiusClass(radius: TonConnectSettingsState['borderRadius']): string {
    if (radius === 'none') {
        return 'rounded-none';
    }
    if (radius === 's') {
        return 'rounded-lg';
    }
    return 'rounded-2xl';
}

function updateThemeColors(
    settings: TonConnectSettingsState,
    theme: Theme,
    patch: (colors: ColorsSet) => ColorsSet
): Partial<TonConnectSettingsState> {
    const currentColors = settings.colorsSet?.[theme] ?? getDefaultColorsForTheme(theme);

    return {
        colorsSet: {
            ...settings.colorsSet,
            [theme]: patch(currentColors)
        }
    };
}

function toggleAction(
    items: TonConnectSettingsState['modals'],
    value: TonConnectSettingsState['modals'][number]
) {
    return items.includes(value) ? items.filter(item => item !== value) : [...items, value];
}

function ThemePanel({
    tonSettings,
    setTonSettings,
    builderSettings,
    setBuilderSettings
}: {
    tonSettings: TonConnectSettingsState;
    setTonSettings: (patch: Partial<TonConnectSettingsState>) => void;
    builderSettings: WidgetBuilderSettings;
    setBuilderSettings: (patch: Partial<WidgetBuilderSettings>) => void;
}) {
    const activeTheme = getThemeForPreview(tonSettings);
    const colors = getPreviewColors(tonSettings);

    return (
        <div className="flex flex-col gap-5">
            <BuilderSection
                title="Theme"
                description="These tokens are exported as TonConnect UI `colorsSet` and applied to the modal preview."
            >
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Theme">
                        <SelectField
                            value={tonSettings.theme}
                            options={THEME_OPTIONS}
                            onChange={theme =>
                                setTonSettings({ theme: theme as TonConnectSettingsState['theme'] })
                            }
                        />
                    </Field>
                    <Field label="Radius">
                        <SelectField
                            value={tonSettings.borderRadius}
                            options={BORDER_OPTIONS}
                            onChange={borderRadius =>
                                setTonSettings({
                                    borderRadius:
                                        borderRadius as TonConnectSettingsState['borderRadius']
                                })
                            }
                        />
                    </Field>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    <ColorField
                        label="Button background"
                        value={colors.connectButton.background}
                        onChange={background =>
                            setTonSettings(
                                updateThemeColors(tonSettings, activeTheme, themeColors => ({
                                    ...themeColors,
                                    connectButton: {
                                        ...themeColors.connectButton,
                                        background
                                    }
                                }))
                            )
                        }
                    />
                    <ColorField
                        label="Button text"
                        value={colors.connectButton.foreground}
                        onChange={foreground =>
                            setTonSettings(
                                updateThemeColors(tonSettings, activeTheme, themeColors => ({
                                    ...themeColors,
                                    connectButton: {
                                        ...themeColors.connectButton,
                                        foreground
                                    }
                                }))
                            )
                        }
                    />
                </div>
            </BuilderSection>

            <BuilderSection title="Modal">
                <div className="grid grid-cols-1 gap-3">
                    <ColorField
                        label="Modal background"
                        value={colors.background.primary}
                        onChange={primary =>
                            setTonSettings(
                                updateThemeColors(tonSettings, activeTheme, themeColors => ({
                                    ...themeColors,
                                    background: {
                                        ...themeColors.background,
                                        primary
                                    }
                                }))
                            )
                        }
                    />
                    <ColorField
                        label="Modal surface"
                        value={colors.background.secondary}
                        onChange={secondary =>
                            setTonSettings(
                                updateThemeColors(tonSettings, activeTheme, themeColors => ({
                                    ...themeColors,
                                    background: {
                                        ...themeColors.background,
                                        secondary,
                                        segment: secondary
                                    }
                                }))
                            )
                        }
                    />
                    <ColorField
                        label="Text"
                        value={colors.text.primary}
                        onChange={primary =>
                            setTonSettings(
                                updateThemeColors(tonSettings, activeTheme, themeColors => ({
                                    ...themeColors,
                                    text: {
                                        ...themeColors.text,
                                        primary
                                    }
                                }))
                            )
                        }
                    />
                    <ColorField
                        label="Secondary text"
                        value={colors.text.secondary}
                        onChange={secondary =>
                            setTonSettings(
                                updateThemeColors(tonSettings, activeTheme, themeColors => ({
                                    ...themeColors,
                                    text: {
                                        ...themeColors.text,
                                        secondary
                                    }
                                }))
                            )
                        }
                    />
                    <ColorField
                        label="Accent"
                        value={colors.accent}
                        onChange={accent =>
                            setTonSettings(
                                updateThemeColors(tonSettings, activeTheme, themeColors => ({
                                    ...themeColors,
                                    accent,
                                    telegramButton: accent
                                }))
                            )
                        }
                    />
                </div>
            </BuilderSection>

            <BuilderSection
                title="Button"
                description="CSS overrides are exported separately and kept optional."
            >
                <Field
                    label="Launcher label"
                    description="Used by the custom launcher export. The built-in TonConnect button keeps its trusted default states."
                >
                    <TextField
                        value={builderSettings.buttonLabel}
                        onChange={buttonLabel => setBuilderSettings({ buttonLabel })}
                    />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Width">
                        <TextField
                            value={builderSettings.buttonWidth}
                            type="number"
                            onChange={buttonWidth =>
                                setBuilderSettings({ buttonWidth: Number(buttonWidth) })
                            }
                        />
                    </Field>
                    <Field label="Height">
                        <TextField
                            value={builderSettings.buttonHeight}
                            type="number"
                            onChange={buttonHeight =>
                                setBuilderSettings({ buttonHeight: Number(buttonHeight) })
                            }
                        />
                    </Field>
                </div>
                <ToggleField
                    label="Full width button"
                    description="Useful for landing-page sections and mobile layouts."
                    checked={builderSettings.buttonFullWidth}
                    onCheckedChange={buttonFullWidth => setBuilderSettings({ buttonFullWidth })}
                />
                <ToggleField
                    label="Export CSS overrides"
                    description="Disable it to keep only official TonConnect UI options."
                    checked={builderSettings.cssOverridesEnabled}
                    onCheckedChange={cssOverridesEnabled =>
                        setBuilderSettings({ cssOverridesEnabled })
                    }
                />
            </BuilderSection>
        </div>
    );
}

function GeneralPanel({
    tonSettings,
    setTonSettings,
    builderSettings,
    setBuilderSettings
}: {
    tonSettings: TonConnectSettingsState;
    setTonSettings: (patch: Partial<TonConnectSettingsState>) => void;
    builderSettings: WidgetBuilderSettings;
    setBuilderSettings: (patch: Partial<WidgetBuilderSettings>) => void;
}) {
    return (
        <div className="flex flex-col gap-5">
            <BuilderSection
                title="Integration"
                description="These values are embedded into generated CDN and React snippets."
            >
                <Field
                    label="Manifest URL"
                    description="Must be hosted on the same domain before production launch."
                >
                    <TextField
                        value={builderSettings.manifestUrl}
                        placeholder="https://example.com/tonconnect-manifest.json"
                        onChange={manifestUrl => setBuilderSettings({ manifestUrl })}
                    />
                </Field>
                <Field label="Container ID">
                    <TextField
                        value={builderSettings.containerId}
                        onChange={containerId => setBuilderSettings({ containerId })}
                    />
                </Field>
            </BuilderSection>

            <BuilderSection title="Behavior">
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Language">
                        <SelectField
                            value={tonSettings.language}
                            options={LANGUAGE_OPTIONS.map(value => ({
                                value,
                                label: value.toUpperCase()
                            }))}
                            onChange={language =>
                                setTonSettings({
                                    language: language as TonConnectSettingsState['language']
                                })
                            }
                        />
                    </Field>
                    <Field label="Return">
                        <SelectField
                            value={tonSettings.returnStrategy}
                            options={RETURN_OPTIONS}
                            onChange={returnStrategy => setTonSettings({ returnStrategy })}
                        />
                    </Field>
                </div>
                <Field label="Skip redirect">
                    <SelectField
                        value={tonSettings.skipRedirect}
                        options={SKIP_OPTIONS}
                        onChange={skipRedirect =>
                            setTonSettings({
                                skipRedirect:
                                    skipRedirect as TonConnectSettingsState['skipRedirect']
                            })
                        }
                    />
                </Field>
                <ToggleField
                    label="Android back handler"
                    description="Passes `enableAndroidBackHandler` to TonConnect UI."
                    checked={tonSettings.enableAndroidBackHandler}
                    onCheckedChange={enableAndroidBackHandler =>
                        setTonSettings({ enableAndroidBackHandler })
                    }
                />
            </BuilderSection>

            <BuilderSection
                title="Action UI"
                description="Choose when TonConnect shows confirmation modals and notifications."
            >
                <div className="flex flex-col gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-secondary-foreground">
                        Modals
                    </p>
                    {ACTION_LABELS.map(action => (
                        <ToggleField
                            key={`modal-${action.value}`}
                            label={action.label}
                            checked={tonSettings.modals.includes(action.value)}
                            onCheckedChange={() =>
                                setTonSettings({
                                    modals: toggleAction(tonSettings.modals, action.value)
                                })
                            }
                        />
                    ))}
                </div>
                <div className="flex flex-col gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-secondary-foreground">
                        Notifications
                    </p>
                    {ACTION_LABELS.map(action => (
                        <ToggleField
                            key={`notification-${action.value}`}
                            label={action.label}
                            checked={tonSettings.notifications.includes(action.value)}
                            onCheckedChange={() =>
                                setTonSettings({
                                    notifications: toggleAction(
                                        tonSettings.notifications,
                                        action.value
                                    )
                                })
                            }
                        />
                    ))}
                </div>
            </BuilderSection>
        </div>
    );
}

function CodeBlock({ value }: { value: string }) {
    return (
        <div className="overflow-hidden rounded-2xl border border-tertiary bg-background">
            <div className="flex items-center justify-between border-b border-tertiary bg-secondary/60 px-3 py-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-secondary-foreground">
                    Generated code
                </span>
                <CopyButton value={value} aria-label="Copy generated code" />
            </div>
            <pre className="max-h-[28rem] overflow-auto p-4 text-xs leading-5 text-foreground">
                <code>{value}</code>
            </pre>
        </div>
    );
}

function downloadSnippet(filename: string, value: string, type: string) {
    const blob = new Blob([value], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

function ExportPanel({
    tonSettings,
    builderSettings
}: {
    tonSettings: TonConnectSettingsState;
    builderSettings: WidgetBuilderSettings;
}) {
    const [exportKind, setExportKind] = useState<ExportKind>('html');
    const snippets = useMemo(
        () => ({
            html: generateSingleHtmlSnippet(tonSettings, builderSettings),
            css: generateCssSnippet(builderSettings),
            js: generateJsSnippet(tonSettings, builderSettings),
            react: generateReactSnippet(tonSettings, builderSettings),
            launcher: generateCustomLauncherSnippet(tonSettings, builderSettings)
        }),
        [tonSettings, builderSettings]
    );

    return (
        <div className="flex flex-col gap-5">
            <BuilderSection
                title="Choose integration method"
                description="Choose a no-build CDN snippet, a package-based React snippet, or a single HTML file."
            >
                <div className="grid grid-cols-1 gap-2">
                    {EXPORT_OPTIONS.map(option => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => setExportKind(option.value)}
                            className={cn(
                                'cursor-pointer rounded-xl border p-3 text-left transition-colors',
                                exportKind === option.value
                                    ? 'border-primary bg-background-bezeled'
                                    : 'border-tertiary/70 bg-tertiary/40 hover:border-primary/40'
                            )}
                        >
                            <span className="block text-sm font-semibold text-foreground">
                                {option.label}
                            </span>
                            <span className="mt-1 block text-xs leading-4 text-secondary-foreground">
                                {option.description}
                            </span>
                        </button>
                    ))}
                </div>
            </BuilderSection>

            <BuilderSection title="Manifest checklist">
                <div className="rounded-xl bg-tertiary/60 p-3 text-xs leading-5 text-secondary-foreground">
                    Before using the widget in production, host a TON Connect manifest on your
                    domain and update the generated `manifestUrl`.
                </div>
            </BuilderSection>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <Button
                    type="button"
                    variant="secondary"
                    size="s"
                    fullWidth
                    onClick={() =>
                        downloadSnippet('ton-connect-widget.html', snippets.html, 'text/html')
                    }
                >
                    Save HTML
                </Button>
                <Button
                    type="button"
                    variant="secondary"
                    size="s"
                    fullWidth
                    onClick={() =>
                        downloadSnippet('ton-connect-widget.css', snippets.css, 'text/css')
                    }
                >
                    Save CSS
                </Button>
                <Button
                    type="button"
                    variant="secondary"
                    size="s"
                    fullWidth
                    onClick={() =>
                        downloadSnippet('ton-connect-widget.js', snippets.js, 'text/javascript')
                    }
                >
                    Save JS
                </Button>
            </div>

            <CodeBlock value={snippets[exportKind]} />
        </div>
    );
}

function PreviewPanel({
    tonSettings,
    builderSettings
}: {
    tonSettings: TonConnectSettingsState;
    builderSettings: WidgetBuilderSettings;
}) {
    const [tonConnectUI, setTonConnectOptions] = useTonConnectUI();
    const colors = getPreviewColors(tonSettings);
    const buttonWidth = builderSettings.buttonFullWidth ? '100%' : builderSettings.buttonWidth;
    const radiusClass = getRadiusClass(tonSettings.borderRadius);
    const previewButtonStyle = {
        width: buttonWidth,
        height: builderSettings.buttonHeight,
        background: colors.connectButton.background,
        color: colors.connectButton.foreground
    };

    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-secondary p-6 md:p-10">
            <div className="mx-auto flex w-full max-w-[28rem] flex-col gap-4 rounded-3xl bg-background p-5 text-foreground">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold">TON Connect widget</h2>
                        <p className="mt-1 text-sm text-secondary-foreground">
                            Preview uses the same settings that will be exported in the generated
                            code.
                        </p>
                    </div>
                    <Settings2 size={18} className="mt-1 text-secondary-foreground" />
                </div>

                <div className="rounded-2xl border border-tertiary bg-secondary/70 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-secondary-foreground">
                        TON Connect button
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            setTonConnectOptions(toTonConnectOptions(tonSettings));
                            tonConnectUI.openModal();
                        }}
                        className={cn(
                            'mt-3 cursor-pointer border-0 px-4 text-sm font-semibold transition-opacity hover:opacity-85',
                            radiusClass
                        )}
                        style={previewButtonStyle}
                    >
                        {builderSettings.buttonLabel}
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-secondary-foreground">
                    <div className="rounded-xl bg-secondary p-3">
                        <span className="block text-tertiary-foreground">Theme</span>
                        <span className="mt-1 block font-semibold text-foreground">
                            {tonSettings.theme}
                        </span>
                    </div>
                    <div className="rounded-xl bg-secondary p-3">
                        <span className="block text-tertiary-foreground">Manifest</span>
                        <span className="mt-1 block truncate font-semibold text-foreground">
                            {builderSettings.manifestUrl}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function WidgetBuilder() {
    const [activeTab, setActiveTab] = useState<BuilderTab>('theme');
    const [tonSettings, setTonSettingsState] = useState<TonConnectSettingsState>(
        DEFAULT_TON_CONNECT_SETTINGS
    );
    const {
        settings: builderSettings,
        setSettings: setBuilderSettings,
        resetSettings: resetBuilderSettings
    } = useWidgetBuilderSettings();

    const setTonSettings = (patch: Partial<TonConnectSettingsState>) => {
        setTonSettingsState(prev => ({ ...prev, ...patch }));
    };

    const resetAll = () => {
        setTonSettingsState(DEFAULT_TON_CONNECT_SETTINGS);
        resetBuilderSettings();
    };

    return (
        <div className="grid h-[calc(100dvh-13rem)] min-h-0 w-full overflow-hidden rounded-3xl border border-tertiary bg-secondary/40 lg:grid-cols-[20rem_minmax(0,1fr)]">
            <aside className="flex min-h-0 flex-col border-b border-tertiary bg-background lg:border-b-0 lg:border-r">
                <div className="flex items-center justify-between gap-3 border-b border-tertiary p-4">
                    <div className="min-w-0">
                        <h1 className="truncate text-lg font-bold text-foreground">
                            Widget builder
                        </h1>
                        <p className="mt-1 text-xs text-secondary-foreground">
                            TON Connect visual editor
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={resetAll}
                        aria-label="Reset all changes"
                    >
                        <RotateCcw size={16} />
                    </Button>
                </div>

                <Tabs
                    value={activeTab}
                    onValueChange={value => setActiveTab(value as BuilderTab)}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <Tabs.List className="grid w-full grid-cols-3 rounded-none bg-background p-0">
                        {TAB_OPTIONS.map(tab => (
                            <Tabs.Trigger
                                key={tab.value}
                                value={tab.value}
                                className="rounded-none border-b-2 border-transparent py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                            >
                                {tab.label}
                            </Tabs.Trigger>
                        ))}
                    </Tabs.List>

                    <div className="min-h-0 flex-1 overflow-y-auto p-4">
                        <Tabs.Content value="theme">
                            <ThemePanel
                                tonSettings={tonSettings}
                                setTonSettings={setTonSettings}
                                builderSettings={builderSettings}
                                setBuilderSettings={setBuilderSettings}
                            />
                        </Tabs.Content>
                        <Tabs.Content value="general">
                            <GeneralPanel
                                tonSettings={tonSettings}
                                setTonSettings={setTonSettings}
                                builderSettings={builderSettings}
                                setBuilderSettings={setBuilderSettings}
                            />
                        </Tabs.Content>
                        <Tabs.Content value="export">
                            <ExportPanel
                                tonSettings={tonSettings}
                                builderSettings={builderSettings}
                            />
                        </Tabs.Content>
                    </div>
                </Tabs>
            </aside>

            <section className="flex min-h-0 min-w-0 flex-col">
                <PreviewPanel tonSettings={tonSettings} builderSettings={builderSettings} />
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-tertiary bg-background p-4">
                    <div className="text-xs leading-5 text-secondary-foreground">
                        Export includes CDN, CSS, JS, React/NPM, and custom launcher variants.
                    </div>
                    <Button
                        type="button"
                        variant="secondary"
                        size="s"
                        onClick={() => setActiveTab('export')}
                    >
                        <Download size={14} />
                        Open export
                    </Button>
                </div>
            </section>
        </div>
    );
}
