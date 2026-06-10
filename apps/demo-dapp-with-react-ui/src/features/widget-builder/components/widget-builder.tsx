import type { ColorsSet, Theme } from '@tonconnect/ui-react';
import { THEME } from '@tonconnect/ui-react';
import { GripVertical, Loader2, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type Dispatch,
    type SetStateAction
} from 'react';

import { ThemeSwitcher } from '../../../core/components/layout/theme-switcher/index';
import { Button } from '../../../core/components/ui/button';
import { Checkbox } from '../../../core/components/ui/checkbox';
import { CopyButton } from '../../../core/components/ui/copy-button';
import { Input } from '../../../core/components/ui/input';
import { Select } from '../../../core/components/ui/select';
import { Tabs } from '../../../core/components/ui/tabs';
import { useIsMobile } from '../../../core/hooks/use-mobile';
import { useTheme } from '../../../core/hooks/use-theme';
import { cn } from '../../../core/utils/cn';
import { ColorField } from '../../dev-settings/components/dev-panel/components/color-field';
import { getDefaultColorsForTheme } from '../../dev-settings/utils/default-colors';
import {
    DEFAULT_TON_CONNECT_SETTINGS,
    serializeSettingsToParams,
    type TonConnectSettingsState
} from '../../dev-settings/utils/settings-url';
import {
    DEFAULT_WIDGET_BUILDER_SETTINGS,
    type WidgetBuilderSettings
} from '../utils/widget-builder-settings';
import {
    clearWidgetBuilderState,
    getDefaultWidgetBuilderState,
    loadWidgetBuilderState,
    saveWidgetBuilderState,
    type WidgetBuilderPersistedState
} from '../utils/widget-builder-storage';
import {
    generateCssSnippet,
    generateCustomLauncherSnippet,
    generateJsSnippet,
    generateReactSnippet,
    generateSingleHtmlSnippet
} from '../utils/snippet-generator';
import {
    ADD_PREVIEW_BLOCK_GROUPS,
    decodeAddBlockOption,
    getConnectPreviewMode,
    getPreviewFrameSize,
    getPreviewBlockTitle,
    getPreviewKind,
    getPreviewSurface,
    isActionBlockType,
    PREVIEW_BLOCK_EXPORT_SLUGS,
    PREVIEW_BLOCK_LABELS,
    type ActionPreviewBlockType,
    type PreviewBlockType,
    type PreviewKind,
    type PreviewMethod,
    type PreviewMode,
    type PreviewSurface,
    type PreviewTrigger
} from '../utils/preview-types';

type BuilderTab = 'theme' | 'general' | 'export';
type MobileWorkspacePanel = 'edit' | 'preview';
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

interface PreviewBlock {
    id: string;
    type: PreviewBlockType;
    x: number;
    y: number;
    width: number;
    height: number;
    method?: PreviewMethod;
    trigger?: PreviewTrigger;
    previewMode?: PreviewMode;
}

interface PreviewDragState {
    id: string;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    width: number;
    height: number;
}

interface BlockOverrideSettings {
    ton?: Partial<TonConnectSettingsState>;
    builder?: Partial<WidgetBuilderSettings>;
}

type BlockOverridesMap = Record<string, BlockOverrideSettings>;

interface FocusedPreviewBlock {
    id: string;
    type: PreviewBlockType;
}

function applyTonSettingsPatch(
    base: Partial<TonConnectSettingsState>,
    patch: Partial<TonConnectSettingsState>
): Partial<TonConnectSettingsState> {
    const next: Partial<TonConnectSettingsState> = { ...base, ...patch };

    if (patch.colorsSet) {
        next.colorsSet = { ...base.colorsSet };

        for (const theme of Object.keys(patch.colorsSet) as Theme[]) {
            const themePatch = patch.colorsSet[theme];
            if (!themePatch) {
                continue;
            }

            const defaults = getDefaultColorsForTheme(theme);
            const current = base.colorsSet?.[theme] ?? defaults;

            next.colorsSet = {
                ...next.colorsSet,
                [theme]: {
                    ...current,
                    ...themePatch,
                    connectButton: {
                        ...current.connectButton,
                        ...themePatch.connectButton
                    },
                    background: {
                        ...current.background,
                        ...themePatch.background
                    },
                    text: {
                        ...current.text,
                        ...themePatch.text
                    },
                    icon: {
                        ...current.icon,
                        ...themePatch.icon
                    },
                    constant: {
                        ...current.constant,
                        ...themePatch.constant
                    }
                }
            };
        }
    }

    return next;
}

function mergeTonSettings(
    global: TonConnectSettingsState,
    override?: Partial<TonConnectSettingsState>
): TonConnectSettingsState {
    if (!override) {
        return global;
    }

    return applyTonSettingsPatch(global, override) as TonConnectSettingsState;
}

function mergeBuilderSettings(
    global: WidgetBuilderSettings,
    override?: Partial<WidgetBuilderSettings>
): WidgetBuilderSettings {
    return override ? { ...global, ...override } : global;
}

function getCanvasMinSize(blocks: PreviewBlock[]): { minWidth: number; minHeight: number } {
    if (blocks.length === 0) {
        return { minWidth: 360, minHeight: 480 };
    }

    return {
        minWidth: Math.max(360, ...blocks.map(block => block.x + block.width + 48)),
        minHeight: Math.max(480, ...blocks.map(block => block.y + block.height + 48))
    };
}

function MobileWorkspaceToggle({
    value,
    onChange
}: {
    value: MobileWorkspacePanel;
    onChange: (value: MobileWorkspacePanel) => void;
}) {
    return (
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-secondary p-1">
            {(['edit', 'preview'] as const).map(panel => (
                <button
                    key={panel}
                    type="button"
                    onClick={() => onChange(panel)}
                    className={cn(
                        'cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                        value === panel
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-secondary-foreground hover:text-foreground'
                    )}
                >
                    {panel === 'edit' ? 'Edit' : 'Preview'}
                </button>
            ))}
        </div>
    );
}

const DEFAULT_PREVIEW_BLOCKS: PreviewBlock[] = [
    { id: 'launcher-1', type: 'launcher', x: 40, y: 300, width: 220, height: 112 },
    { id: 'desktop-modal-1', type: 'desktopModal', x: 300, y: 40, width: 520, height: 760 }
];

function getInitialWidgetBuilderState(): WidgetBuilderPersistedState {
    return loadWidgetBuilderState() ?? getDefaultWidgetBuilderState();
}

function createPreviewBlock(
    type: PreviewBlockType,
    index: number,
    actionOptions?: { method: PreviewMethod; trigger: PreviewTrigger }
): PreviewBlock {
    const id = `${type}-${Date.now()}-${index}`;

    if (type === 'launcher') {
        return { id, type, x: 48, y: 48, width: 220, height: 112 };
    }

    if (type === 'mobileModal') {
        const size = getPreviewFrameSize('mobileModal');

        return { id, type, x: 480, y: 24, ...size };
    }

    if (type === 'actionNotification') {
        const size = getPreviewFrameSize('actionNotification');
        const method = actionOptions?.method ?? 'sendTransaction';
        const trigger = actionOptions?.trigger ?? 'before';

        return {
            id,
            type,
            x: 320,
            y: 480,
            ...size,
            method,
            trigger,
            previewMode: 'desktop'
        };
    }

    if (type === 'actionModal') {
        const method = actionOptions?.method ?? 'sendTransaction';
        const trigger = actionOptions?.trigger ?? 'before';
        const size = getPreviewFrameSize('actionModal', 'desktop', trigger);

        return {
            id,
            type,
            x: 320,
            y: 40,
            ...size,
            method,
            trigger,
            previewMode: 'desktop'
        };
    }

    const size = getPreviewFrameSize('desktopModal');

    return { id, type, x: 320, y: 40, ...size };
}

function buildPreviewIframeSrc(
    previewSettingsQuery: string,
    params: {
        previewKind: PreviewKind;
        previewMode: PreviewMode;
        previewMethod?: PreviewMethod;
        previewSurface?: PreviewSurface;
        previewTrigger?: PreviewTrigger;
    }
) {
    const search = new URLSearchParams(previewSettingsQuery);

    search.set('previewMode', params.previewMode);
    search.set('previewKind', params.previewKind);

    if (params.previewKind === 'action') {
        search.set('previewMethod', params.previewMethod ?? 'sendTransaction');
        search.set('previewSurface', params.previewSurface ?? 'modal');
        search.set('previewTrigger', params.previewTrigger ?? 'before');
    }

    return `/widget-preview?${search.toString()}`;
}

function getCanvasBackgroundStyle(previewBackground: string, isDark: boolean): React.CSSProperties {
    const dotColor = isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.1)';

    return {
        backgroundColor: previewBackground,
        backgroundImage: `radial-gradient(circle, ${dotColor} 1.25px, transparent 1.25px)`,
        backgroundSize: '24px 24px',
        backgroundPosition: '12px 12px'
    };
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

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
        <div className="flex items-start gap-3 rounded-xl bg-tertiary/60 p-2.5">
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
        <section className="flex flex-col gap-3 border-t border-tertiary/70 pt-4 first:border-t-0 first:pt-0">
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

function FocusContextBanner({
    focusedBlock,
    hasOverrides,
    onClearOverrides,
    onClearFocus
}: {
    focusedBlock: FocusedPreviewBlock | null;
    hasOverrides: boolean;
    onClearOverrides: () => void;
    onClearFocus: () => void;
}) {
    if (!focusedBlock) {
        return (
            <div className="mb-4 rounded-xl bg-tertiary/50 px-3 py-2 text-xs leading-5 text-secondary-foreground">
                Global settings apply to all preview blocks. Use Edit on a block to override it
                locally.
            </div>
        );
    }

    return (
        <div className="mb-4 flex flex-col gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2">
            <div className="flex items-start justify-between gap-2">
                <p className="text-xs leading-5 text-foreground">
                    Editing{' '}
                    <span className="font-semibold">{PREVIEW_BLOCK_LABELS[focusedBlock.type]}</span>
                    {hasOverrides ? ' with local overrides' : ''}
                </p>
                <button
                    type="button"
                    className="shrink-0 text-xs font-medium text-primary hover:underline"
                    onClick={onClearFocus}
                >
                    Global
                </button>
            </div>
            {hasOverrides ? (
                <button
                    type="button"
                    className="self-start text-xs font-medium text-secondary-foreground hover:text-foreground"
                    onClick={onClearOverrides}
                >
                    Reset block to global
                </button>
            ) : null}
        </div>
    );
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
                    label="Button label"
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

type ExportSnippets = Record<ExportKind, string>;

function buildExportSnippets(
    tonSettings: TonConnectSettingsState,
    builderSettings: WidgetBuilderSettings
): ExportSnippets {
    return {
        html: generateSingleHtmlSnippet(tonSettings, builderSettings),
        css: generateCssSnippet(builderSettings),
        js: generateJsSnippet(tonSettings, builderSettings),
        react: generateReactSnippet(tonSettings, builderSettings),
        launcher: generateCustomLauncherSnippet(tonSettings, builderSettings)
    };
}

function ExportPanel({
    tonSettings,
    builderSettings,
    focusedBlock
}: {
    tonSettings: TonConnectSettingsState;
    builderSettings: WidgetBuilderSettings;
    focusedBlock: FocusedPreviewBlock | null;
}) {
    const [exportKind, setExportKind] = useState<ExportKind>('html');
    const snippets = useMemo(
        () => buildExportSnippets(tonSettings, builderSettings),
        [tonSettings, builderSettings]
    );
    const filenamePrefix = focusedBlock
        ? `ton-connect-widget-${PREVIEW_BLOCK_EXPORT_SLUGS[focusedBlock.type]}`
        : 'ton-connect-widget';

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

            {focusedBlock ? (
                <div className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-xs leading-5 text-foreground">
                    Exporting{' '}
                    <span className="font-semibold">{PREVIEW_BLOCK_LABELS[focusedBlock.type]}</span>{' '}
                    settings. Switch to Global to export shared defaults.
                </div>
            ) : null}

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <Button
                    type="button"
                    variant="secondary"
                    size="s"
                    fullWidth
                    onClick={() =>
                        downloadSnippet(`${filenamePrefix}.html`, snippets.html, 'text/html')
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
                        downloadSnippet(`${filenamePrefix}.css`, snippets.css, 'text/css')
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
                        downloadSnippet(`${filenamePrefix}.js`, snippets.js, 'text/javascript')
                    }
                >
                    Save JS
                </Button>
            </div>

            <CodeBlock value={snippets[exportKind]} />
        </div>
    );
}

function buildPreviewSettingsSignature(params: {
    previewSettingsQuery: string;
    resetToken: number;
    previewKind: PreviewKind;
    previewMode: PreviewMode;
    previewMethod?: PreviewMethod;
    previewSurface?: PreviewSurface;
    previewTrigger?: PreviewTrigger;
}): string {
    return JSON.stringify(params);
}

function PreviewModalFrame({
    previewSettingsQuery,
    resetToken,
    title,
    previewKind,
    previewMode,
    previewMethod,
    previewSurface,
    previewTrigger
}: {
    previewSettingsQuery: string;
    resetToken: number;
    title: string;
    previewKind: PreviewKind;
    previewMode: PreviewMode;
    previewMethod?: PreviewMethod;
    previewSurface?: PreviewSurface;
    previewTrigger?: PreviewTrigger;
}) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [previewReady, setPreviewReady] = useState(false);
    const lastPostedSignatureRef = useRef('');
    const readySignatureRef = useRef<string | null>(null);
    const previewSignatureRef = useRef('');
    const [iframeSrc] = useState(() =>
        buildPreviewIframeSrc(previewSettingsQuery, {
            previewKind,
            previewMode,
            previewMethod,
            previewSurface,
            previewTrigger
        })
    );
    const previewSignature = useMemo(
        () =>
            buildPreviewSettingsSignature({
                previewSettingsQuery,
                resetToken,
                previewKind,
                previewMode,
                previewMethod,
                previewSurface,
                previewTrigger
            }),
        [
            previewSettingsQuery,
            resetToken,
            previewKind,
            previewMode,
            previewMethod,
            previewSurface,
            previewTrigger
        ]
    );

    previewSignatureRef.current = previewSignature;

    const postPreviewSettings = useCallback(() => {
        if (lastPostedSignatureRef.current === previewSignature) {
            return;
        }

        lastPostedSignatureRef.current = previewSignature;

        iframeRef.current?.contentWindow?.postMessage(
            {
                type: 'widget-builder-preview-settings',
                query: previewSettingsQuery,
                resetToken,
                previewKind,
                previewMode,
                previewMethod,
                previewSurface,
                previewTrigger
            },
            window.location.origin
        );
    }, [
        previewSignature,
        previewSettingsQuery,
        resetToken,
        previewKind,
        previewMode,
        previewMethod,
        previewSurface,
        previewTrigger
    ]);

    useEffect(() => {
        if (readySignatureRef.current === previewSignature) {
            setPreviewReady(true);
            return;
        }

        readySignatureRef.current = null;
        setPreviewReady(false);
        lastPostedSignatureRef.current = '';
    }, [previewSignature]);

    useEffect(() => {
        postPreviewSettings();
    }, [postPreviewSettings]);

    useEffect(() => {
        const onMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) {
                return;
            }

            if (
                event.data?.type === 'widget-builder-preview-ready' &&
                event.source === iframeRef.current?.contentWindow
            ) {
                readySignatureRef.current = previewSignatureRef.current;
                setPreviewReady(true);
            }
        };

        window.addEventListener('message', onMessage);

        return () => window.removeEventListener('message', onMessage);
    }, []);

    return (
        <div className="relative h-full w-full overflow-hidden">
            <div
                className={cn(
                    'absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-background/70 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] transition-opacity duration-200 ease-out',
                    previewReady && 'pointer-events-none opacity-0'
                )}
                aria-hidden={previewReady}
            >
                <Loader2 className="size-10 animate-spin text-secondary-foreground/70" />
            </div>
            <iframe
                ref={iframeRef}
                title={title}
                src={iframeSrc}
                onLoad={() => {
                    lastPostedSignatureRef.current = '';
                    postPreviewSettings();
                }}
                className={cn(
                    'absolute inset-0 h-full w-full overflow-hidden border-0 bg-transparent transition-opacity duration-200 ease-out',
                    previewReady ? 'opacity-100' : 'opacity-0'
                )}
            />
        </div>
    );
}

function ModalPreviewPanel({
    blocks,
    setBlocks,
    resetToken,
    focusedBlockId,
    blockOverrides,
    onFocusBlock,
    onBlockRemoved,
    getBlockTonSettings,
    getBlockBuilderSettings
}: {
    blocks: PreviewBlock[];
    setBlocks: Dispatch<SetStateAction<PreviewBlock[]>>;
    resetToken: number;
    focusedBlockId: string | null;
    blockOverrides: BlockOverridesMap;
    onFocusBlock: (block: FocusedPreviewBlock | null) => void;
    onBlockRemoved: (blockId: string) => void;
    getBlockTonSettings: (blockId: string) => TonConnectSettingsState;
    getBlockBuilderSettings: (blockId: string) => WidgetBuilderSettings;
}) {
    const { calculatedTheme } = useTheme();
    const isCompactLayout = useIsMobile('lg');
    const canvasBackgroundStyle = getCanvasBackgroundStyle(
        'var(--tertiary)',
        calculatedTheme === 'dark'
    );
    const canvasRef = useRef<HTMLDivElement>(null);
    const canvasSurfaceRef = useRef<HTMLDivElement>(null);
    const blockNodeRefs = useRef(new Map<string, HTMLDivElement>());
    const dragLiveRef = useRef<PreviewDragState | null>(null);
    const dragPointerIdRef = useRef<number | null>(null);
    const dragCaptureTargetRef = useRef<HTMLElement | null>(null);
    const lastPointerPositionRef = useRef({ x: 0, y: 0 });
    const stackOrderRef = useRef(new Map<string, number>());
    const [stackRevision, setStackRevision] = useState(0);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const canvasMinSize = useMemo(() => getCanvasMinSize(blocks), [blocks]);

    const bringBlockToFront = useCallback(
        (id: string) => {
            const currentMax = blocks.reduce((max, block, index) => {
                const order = stackOrderRef.current.get(block.id) ?? index;

                return Math.max(max, order);
            }, -1);

            stackOrderRef.current.set(id, currentMax + 1);
            setStackRevision(revision => revision + 1);
        },
        [blocks]
    );

    const getBlockZIndex = useCallback(
        (blockId: string, blockIndex: number) => {
            void stackRevision;

            return 10 + (stackOrderRef.current.get(blockId) ?? blockIndex);
        },
        [stackRevision]
    );

    const getDraggedPosition = (dragState: PreviewDragState, clientX: number, clientY: number) => {
        const canvasSurface = canvasSurfaceRef.current;

        if (!canvasSurface) {
            return { x: dragState.originX, y: dragState.originY };
        }

        return {
            x: clamp(
                dragState.originX + clientX - dragState.startX,
                0,
                Math.max(0, canvasSurface.offsetWidth - dragState.width)
            ),
            y: clamp(
                dragState.originY + clientY - dragState.startY,
                0,
                Math.max(0, canvasSurface.offsetHeight - dragState.height)
            )
        };
    };

    const updateDragVisual = (dragState: PreviewDragState, clientX: number, clientY: number) => {
        const node = blockNodeRefs.current.get(dragState.id);

        if (!node) {
            return;
        }

        const { x, y } = getDraggedPosition(dragState, clientX, clientY);

        node.style.transform = `translate(${x - dragState.originX}px, ${y - dragState.originY}px)`;
    };

    const clearDragVisual = (dragState: PreviewDragState) => {
        const node = blockNodeRefs.current.get(dragState.id);

        if (!node) {
            return;
        }

        node.style.transform = '';
        node.style.zIndex = '';
    };

    const commitDragPosition = (dragState: PreviewDragState, clientX: number, clientY: number) => {
        const { x, y } = getDraggedPosition(dragState, clientX, clientY);

        bringBlockToFront(dragState.id);
        setBlocks(currentBlocks =>
            currentBlocks.map(block =>
                block.id === dragState.id
                    ? {
                          ...block,
                          x,
                          y
                      }
                    : block
            )
        );
    };

    const releaseDragPointerCapture = () => {
        const captureTarget = dragCaptureTargetRef.current;
        const pointerId = dragPointerIdRef.current;

        dragCaptureTargetRef.current = null;
        dragPointerIdRef.current = null;

        if (captureTarget && pointerId !== null) {
            try {
                captureTarget.releasePointerCapture(pointerId);
            } catch {
                // Pointer was already released.
            }
        }
    };

    const finishDragging = (clientX: number, clientY: number) => {
        const dragState = dragLiveRef.current;

        releaseDragPointerCapture();

        if (!dragState) {
            setDraggingId(null);
            return;
        }

        clearDragVisual(dragState);
        commitDragPosition(dragState, clientX, clientY);
        dragLiveRef.current = null;
        setDraggingId(null);
    };

    useEffect(() => {
        if (!draggingId) {
            return;
        }

        const isActiveDragPointer = (pointerId: number) =>
            dragPointerIdRef.current === null || dragPointerIdRef.current === pointerId;

        const onPointerMove = (event: PointerEvent) => {
            if (!isActiveDragPointer(event.pointerId)) {
                return;
            }

            lastPointerPositionRef.current = { x: event.clientX, y: event.clientY };

            const dragState = dragLiveRef.current;

            if (!dragState) {
                return;
            }

            updateDragVisual(dragState, event.clientX, event.clientY);
        };

        const onPointerEnd = (event: PointerEvent) => {
            if (!isActiveDragPointer(event.pointerId)) {
                return;
            }

            finishDragging(event.clientX, event.clientY);
        };

        const onWindowBlur = () => {
            const { x, y } = lastPointerPositionRef.current;
            finishDragging(x, y);
        };

        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerEnd, true);
        document.addEventListener('pointercancel', onPointerEnd, true);
        window.addEventListener('blur', onWindowBlur);

        return () => {
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', onPointerEnd, true);
            document.removeEventListener('pointercancel', onPointerEnd, true);
            window.removeEventListener('blur', onWindowBlur);
        };
    }, [draggingId]);

    const addBlock = (type: PreviewBlockType) => {
        setBlocks(currentBlocks => [
            ...currentBlocks,
            createPreviewBlock(type, currentBlocks.length)
        ]);
    };

    const addActionBlock = (
        type: ActionPreviewBlockType,
        method: PreviewMethod,
        trigger: PreviewTrigger
    ) => {
        setBlocks(currentBlocks => [
            ...currentBlocks,
            createPreviewBlock(type, currentBlocks.length, { method, trigger })
        ]);
    };

    const handleAddBlockOption = (value: string) => {
        const parsed = decodeAddBlockOption(value);

        if (!parsed) {
            return;
        }

        if (parsed.method && parsed.trigger && isActionBlockType(parsed.type)) {
            addActionBlock(parsed.type, parsed.method, parsed.trigger);
        } else {
            addBlock(parsed.type);
        }
    };

    const removeBlock = (id: string) => {
        setBlocks(currentBlocks => currentBlocks.filter(block => block.id !== id));
        onBlockRemoved(id);
        if (focusedBlockId === id) {
            onFocusBlock(null);
        }
    };

    const resetLayout = () => {
        setBlocks(DEFAULT_PREVIEW_BLOCKS);
    };

    const activateBlock = (block: PreviewBlock) => {
        focusBlock({ id: block.id, type: block.type });
    };

    const startDragging = (block: PreviewBlock, event: React.PointerEvent<HTMLButtonElement>) => {
        if (event.button !== 0) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        activateBlock(block);

        const dragState = {
            id: block.id,
            startX: event.clientX,
            startY: event.clientY,
            originX: block.x,
            originY: block.y,
            width: block.width,
            height: block.height
        };
        const node = blockNodeRefs.current.get(block.id);

        dragLiveRef.current = dragState;
        dragPointerIdRef.current = event.pointerId;
        dragCaptureTargetRef.current = event.currentTarget;
        lastPointerPositionRef.current = { x: event.clientX, y: event.clientY };

        event.currentTarget.setPointerCapture(event.pointerId);

        if (node) {
            node.style.zIndex = '100';
        }

        setDraggingId(block.id);
    };

    const focusBlock = (block: FocusedPreviewBlock) => {
        bringBlockToFront(block.id);
        onFocusBlock(block);
    };

    return (
        <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background">
            <div className="flex shrink-0 flex-col gap-2 border-b border-tertiary/60 bg-background px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5 sm:py-3">
                <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold uppercase tracking-wide text-foreground">
                        Preview
                    </h2>
                </div>
                <div className="flex min-w-0 items-center gap-2">
                    <Select.Root onValueChange={handleAddBlockOption}>
                        <Select.Trigger
                            variant="secondary"
                            size="xs"
                            borderRadius="l"
                            className="shrink-0 gap-1.5"
                        >
                            <Plus size={14} />
                            Add block
                        </Select.Trigger>
                        <Select.Content
                            align="end"
                            className="min-w-64 max-h-[min(24rem,70vh)] overflow-y-auto"
                        >
                            {ADD_PREVIEW_BLOCK_GROUPS.map((group, groupIndex) => (
                                <div key={group.label}>
                                    {groupIndex > 0 ? (
                                        <div className="mx-2 my-1 border-t border-tertiary/60" />
                                    ) : null}
                                    <div className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-secondary-foreground">
                                        {group.label}
                                    </div>
                                    {group.options.map(option => (
                                        <Select.Item key={option.value} value={option.value}>
                                            {option.label}
                                        </Select.Item>
                                    ))}
                                </div>
                            ))}
                        </Select.Content>
                    </Select.Root>
                    <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        className="shrink-0"
                        onClick={resetLayout}
                    >
                        <span className="hidden sm:inline">Reset layout</span>
                        <span className="sm:hidden">Reset</span>
                    </Button>
                    <ThemeSwitcher />
                </div>
            </div>

            <div
                ref={canvasRef}
                className={cn(
                    'relative min-h-0 flex-1 overscroll-contain',
                    isCompactLayout ? 'overflow-auto' : 'overflow-x-auto overflow-y-hidden'
                )}
                style={canvasBackgroundStyle}
                onClick={() => onFocusBlock(null)}
            >
                <div
                    ref={canvasSurfaceRef}
                    className={cn('relative', isCompactLayout ? 'min-h-full' : 'h-full')}
                    style={{
                        minWidth: canvasMinSize.minWidth,
                        ...(isCompactLayout && {
                            minHeight: `max(${canvasMinSize.minHeight}px, 100%)`
                        })
                    }}
                >
                    {blocks.map((block, blockIndex) => {
                        const blockTonSettings = getBlockTonSettings(block.id);
                        const blockBuilderSettings = getBlockBuilderSettings(block.id);
                        const blockColors = getPreviewColors(blockTonSettings);
                        const blockButtonWidth = blockBuilderSettings.buttonFullWidth
                            ? '100%'
                            : blockBuilderSettings.buttonWidth;
                        const blockRadiusClass = getRadiusClass(blockTonSettings.borderRadius);
                        const blockButtonStyle = {
                            width: blockButtonWidth,
                            height: blockBuilderSettings.buttonHeight,
                            background: blockColors.connectButton.background,
                            color: blockColors.connectButton.foreground
                        };
                        const blockPreviewQuery = new URLSearchParams(
                            serializeSettingsToParams(blockTonSettings)
                        ).toString();
                        const hasBlockOverrides = Boolean(blockOverrides[block.id]);

                        const blockFocusClassName = cn(
                            'transition-shadow duration-150',
                            focusedBlockId === block.id
                                ? 'shadow-lg ring-2 ring-primary'
                                : draggingId === block.id
                                  ? 'shadow-lg ring-2 ring-primary/35'
                                  : 'hover:shadow-md',
                            hasBlockOverrides &&
                                focusedBlockId !== block.id &&
                                'ring-1 ring-primary/25'
                        );

                        return (
                            <div
                                key={block.id}
                                ref={node => {
                                    if (node) {
                                        blockNodeRefs.current.set(block.id, node);
                                    } else {
                                        blockNodeRefs.current.delete(block.id);
                                    }
                                }}
                                className="group absolute"
                                onClick={() => activateBlock(block)}
                                onKeyDown={event => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                        event.preventDefault();
                                        activateBlock(block);
                                    }
                                }}
                                role="button"
                                tabIndex={0}
                                aria-label={`Select ${getPreviewBlockTitle(block)}`}
                                style={{
                                    left: block.x,
                                    top: block.y,
                                    width: block.width,
                                    height: block.height,
                                    zIndex: getBlockZIndex(block.id, blockIndex)
                                }}
                            >
                                <div
                                    className={cn(
                                        'absolute inset-x-2 top-2 z-20 flex items-center justify-between gap-2 transition-opacity',
                                        focusedBlockId === block.id
                                            ? 'opacity-100'
                                            : 'opacity-0 group-hover:opacity-100'
                                    )}
                                    onClick={event => event.stopPropagation()}
                                    onKeyDown={event => event.stopPropagation()}
                                >
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            className="grid size-7 cursor-grab place-items-center rounded-full border border-tertiary/70 bg-background/90 text-secondary-foreground shadow-sm active:cursor-grabbing"
                                            aria-label={`Move ${PREVIEW_BLOCK_LABELS[block.type]}`}
                                            onPointerDown={event => startDragging(block, event)}
                                            onLostPointerCapture={event => {
                                                if (
                                                    dragLiveRef.current?.id === block.id &&
                                                    dragPointerIdRef.current === event.pointerId
                                                ) {
                                                    finishDragging(
                                                        lastPointerPositionRef.current.x,
                                                        lastPointerPositionRef.current.y
                                                    );
                                                }
                                            }}
                                        >
                                            <GripVertical size={14} />
                                        </button>
                                        <button
                                            type="button"
                                            className="grid size-7 place-items-center rounded-full border border-tertiary/70 bg-background/90 text-secondary-foreground shadow-sm hover:text-error"
                                            aria-label={`Remove ${PREVIEW_BLOCK_LABELS[block.type]}`}
                                            onClick={event => {
                                                event.stopPropagation();
                                                removeBlock(block.id);
                                            }}
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        className={cn(
                                            'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold shadow-sm transition-colors',
                                            focusedBlockId === block.id
                                                ? 'border-primary bg-primary text-primary-foreground'
                                                : 'border-tertiary/70 bg-background/90 text-secondary-foreground hover:text-foreground'
                                        )}
                                        aria-label={`Edit ${PREVIEW_BLOCK_LABELS[block.type]}`}
                                        aria-pressed={focusedBlockId === block.id}
                                        onClick={event => {
                                            event.stopPropagation();
                                            focusBlock({ id: block.id, type: block.type });
                                        }}
                                    >
                                        <Pencil size={12} />
                                        Edit
                                    </button>
                                </div>

                                {block.type === 'launcher' ? (
                                    <div
                                        className={cn(
                                            'flex h-full cursor-pointer items-center justify-center border border-tertiary/60 bg-background/70 p-4 shadow-sm',
                                            blockRadiusClass,
                                            blockFocusClassName
                                        )}
                                    >
                                        <button
                                            type="button"
                                            className={cn(
                                                'cursor-default border-0 px-4 text-sm font-semibold shadow-sm',
                                                blockRadiusClass
                                            )}
                                            style={blockButtonStyle}
                                        >
                                            {blockBuilderSettings.buttonLabel}
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        className={cn(
                                            'relative h-full overflow-hidden rounded-2xl bg-white/5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]',
                                            blockFocusClassName
                                        )}
                                    >
                                        <PreviewModalFrame
                                            previewSettingsQuery={blockPreviewQuery}
                                            resetToken={resetToken}
                                            title={`${getPreviewBlockTitle(block)} preview`}
                                            previewKind={getPreviewKind(block.type)}
                                            previewMode={
                                                isActionBlockType(block.type)
                                                    ? (block.previewMode ?? 'desktop')
                                                    : getConnectPreviewMode(block.type)
                                            }
                                            previewMethod={block.method}
                                            previewSurface={
                                                getPreviewSurface(block.type) ?? undefined
                                            }
                                            previewTrigger={block.trigger}
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export function WidgetBuilder() {
    const [activeTab, setActiveTab] = useState<BuilderTab>(
        () => getInitialWidgetBuilderState().activeTab
    );
    const [resetToken, setResetToken] = useState(0);
    const [previewBlocks, setPreviewBlocks] = useState<PreviewBlock[]>(
        () => getInitialWidgetBuilderState().previewBlocks
    );
    const [focusedBlock, setFocusedBlock] = useState<FocusedPreviewBlock | null>(
        () => getInitialWidgetBuilderState().focusedBlock
    );
    const [blockOverrides, setBlockOverrides] = useState<BlockOverridesMap>(
        () => getInitialWidgetBuilderState().blockOverrides
    );
    const [tonSettings, setTonSettingsState] = useState<TonConnectSettingsState>(
        () => getInitialWidgetBuilderState().tonSettings
    );
    const [builderSettings, setBuilderSettingsState] = useState<WidgetBuilderSettings>(
        () => getInitialWidgetBuilderState().builderSettings
    );
    const hasHydratedRef = useRef(false);
    const isCompactLayout = useIsMobile('lg');
    const [mobilePanel, setMobilePanel] = useState<MobileWorkspacePanel>('edit');

    const handleFocusBlock = useCallback(
        (block: FocusedPreviewBlock | null) => {
            setFocusedBlock(block);

            if (block && isCompactLayout) {
                setMobilePanel('edit');
            }
        },
        [isCompactLayout]
    );

    const editingTonSettings = useMemo(
        () =>
            focusedBlock
                ? mergeTonSettings(tonSettings, blockOverrides[focusedBlock.id]?.ton)
                : tonSettings,
        [focusedBlock, tonSettings, blockOverrides]
    );

    const editingBuilderSettings = useMemo(
        () =>
            focusedBlock
                ? mergeBuilderSettings(builderSettings, blockOverrides[focusedBlock.id]?.builder)
                : builderSettings,
        [focusedBlock, builderSettings, blockOverrides]
    );

    const getBlockTonSettings = useCallback(
        (blockId: string) => mergeTonSettings(tonSettings, blockOverrides[blockId]?.ton),
        [tonSettings, blockOverrides]
    );

    const getBlockBuilderSettings = useCallback(
        (blockId: string) =>
            mergeBuilderSettings(builderSettings, blockOverrides[blockId]?.builder),
        [builderSettings, blockOverrides]
    );

    const setTonSettings = (patch: Partial<TonConnectSettingsState>) => {
        if (!focusedBlock) {
            setTonSettingsState(prev => ({ ...prev, ...patch }));
            return;
        }

        setBlockOverrides(prev => ({
            ...prev,
            [focusedBlock.id]: {
                ...prev[focusedBlock.id],
                ton: applyTonSettingsPatch(prev[focusedBlock.id]?.ton ?? {}, patch)
            }
        }));
    };

    const setEditingBuilderSettings = (patch: Partial<WidgetBuilderSettings>) => {
        if (!focusedBlock) {
            setBuilderSettingsState(prev => ({ ...prev, ...patch }));
            return;
        }

        setBlockOverrides(prev => ({
            ...prev,
            [focusedBlock.id]: {
                ...prev[focusedBlock.id],
                builder: {
                    ...prev[focusedBlock.id]?.builder,
                    ...patch
                }
            }
        }));
    };

    const clearFocusedBlockOverrides = () => {
        if (!focusedBlock) {
            return;
        }

        setBlockOverrides(prev => {
            const next = { ...prev };
            delete next[focusedBlock.id];
            return next;
        });
    };

    const handleBlockRemoved = (blockId: string) => {
        setBlockOverrides(prev => {
            if (!prev[blockId]) {
                return prev;
            }

            const next = { ...prev };
            delete next[blockId];
            return next;
        });
    };

    useEffect(() => {
        if (resetToken === 0) {
            return;
        }

        setPreviewBlocks(DEFAULT_PREVIEW_BLOCKS);
    }, [resetToken]);

    useEffect(() => {
        if (!hasHydratedRef.current) {
            hasHydratedRef.current = true;
            return;
        }

        saveWidgetBuilderState({
            tonSettings,
            builderSettings,
            previewBlocks,
            blockOverrides,
            focusedBlock,
            activeTab
        });
    }, [tonSettings, builderSettings, previewBlocks, blockOverrides, focusedBlock, activeTab]);

    const resetAll = () => {
        clearWidgetBuilderState();
        setTonSettingsState(DEFAULT_TON_CONNECT_SETTINGS);
        setBuilderSettingsState(DEFAULT_WIDGET_BUILDER_SETTINGS);
        setBlockOverrides({});
        setFocusedBlock(null);
        setActiveTab('theme');
        setResetToken(token => token + 1);
    };

    const focusedBlockHasOverrides = focusedBlock
        ? Boolean(blockOverrides[focusedBlock.id]?.ton || blockOverrides[focusedBlock.id]?.builder)
        : false;

    return (
        <div className="grid h-full min-h-0 w-full overflow-hidden bg-secondary/40 max-lg:grid-rows-[auto_minmax(0,1fr)] lg:grid-cols-[22rem_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)]">
            <div className="col-span-full flex items-center gap-2 border-b border-tertiary bg-background px-3 py-2 lg:hidden">
                <div className="min-w-0 flex-1">
                    <h1 className="truncate text-base font-bold text-foreground">Widget builder</h1>
                </div>
                <div className="w-[10.5rem] shrink-0">
                    <MobileWorkspaceToggle value={mobilePanel} onChange={setMobilePanel} />
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

            <aside
                className={cn(
                    'flex h-full min-h-0 flex-col overflow-hidden border-b border-tertiary bg-background lg:border-b-0 lg:border-r',
                    mobilePanel === 'preview' && 'max-lg:hidden'
                )}
            >
                <div className="hidden items-center justify-between gap-3 border-b border-tertiary px-4 py-3 lg:flex">
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
                                className="rounded-none border-b-2 border-transparent py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none sm:py-3"
                            >
                                {tab.label}
                            </Tabs.Trigger>
                        ))}
                    </Tabs.List>

                    <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4">
                        <FocusContextBanner
                            focusedBlock={focusedBlock}
                            hasOverrides={focusedBlockHasOverrides}
                            onClearOverrides={clearFocusedBlockOverrides}
                            onClearFocus={() => handleFocusBlock(null)}
                        />
                        <Tabs.Content value="theme">
                            <ThemePanel
                                tonSettings={editingTonSettings}
                                setTonSettings={setTonSettings}
                                builderSettings={editingBuilderSettings}
                                setBuilderSettings={setEditingBuilderSettings}
                            />
                        </Tabs.Content>
                        <Tabs.Content value="general">
                            <GeneralPanel
                                tonSettings={editingTonSettings}
                                setTonSettings={setTonSettings}
                                builderSettings={editingBuilderSettings}
                                setBuilderSettings={setEditingBuilderSettings}
                            />
                        </Tabs.Content>
                        <Tabs.Content value="export">
                            <ExportPanel
                                tonSettings={editingTonSettings}
                                builderSettings={editingBuilderSettings}
                                focusedBlock={focusedBlock}
                            />
                        </Tabs.Content>
                    </div>
                </Tabs>
            </aside>

            <section
                className={cn(
                    'flex h-full min-h-0 min-w-0 flex-col overflow-hidden',
                    mobilePanel === 'edit' && 'max-lg:hidden'
                )}
            >
                <ModalPreviewPanel
                    blocks={previewBlocks}
                    setBlocks={setPreviewBlocks}
                    resetToken={resetToken}
                    focusedBlockId={focusedBlock?.id ?? null}
                    blockOverrides={blockOverrides}
                    onFocusBlock={handleFocusBlock}
                    onBlockRemoved={handleBlockRemoved}
                    getBlockTonSettings={getBlockTonSettings}
                    getBlockBuilderSettings={getBlockBuilderSettings}
                />
            </section>
        </div>
    );
}
