import {
    DEFAULT_TON_CONNECT_SETTINGS,
    parseSettingsFromSearchParams,
    type TonConnectSettingsState
} from '../../dev-settings/utils/settings-url';
import {
    normalizeWidgetBuilderSettings,
    parseWidgetBuilderSettingsFromSearchParams,
    type WidgetBuilderSettings
} from './widget-builder-settings';
import {
    getPreviewFrameSize,
    PREVIEW_BLOCK_TYPES,
    PREVIEW_METHODS,
    PREVIEW_MODES,
    PREVIEW_TRIGGERS,
    type PreviewBlockType,
    type PreviewMethod,
    type PreviewMode,
    type PreviewTrigger
} from './preview-types';

const STORAGE_KEY = 'widget-builder-state';
const LEGACY_CANVAS_STORAGE_KEY = 'widget-builder-canvas-state';
const STORAGE_VERSION = 3;

type BuilderTab = 'theme' | 'general' | 'export';

const BUILDER_TABS = new Set<BuilderTab>(['theme', 'general', 'export']);

export interface StoredPreviewBlock {
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

export interface StoredBlockOverrideSettings {
    ton?: Partial<TonConnectSettingsState>;
    builder?: Partial<WidgetBuilderSettings>;
}

export interface StoredFocusedPreviewBlock {
    id: string;
    type: PreviewBlockType;
}

export interface WidgetBuilderPersistedState {
    tonSettings: TonConnectSettingsState;
    builderSettings: WidgetBuilderSettings;
    previewBlocks: StoredPreviewBlock[];
    blockOverrides: Record<string, StoredBlockOverrideSettings>;
    focusedBlock: StoredFocusedPreviewBlock | null;
    activeTab: BuilderTab;
}

interface PersistedPayload {
    version: number;
    tonSettings: TonConnectSettingsState;
    builderSettings: WidgetBuilderSettings;
    previewBlocks: StoredPreviewBlock[];
    blockOverrides: Record<string, StoredBlockOverrideSettings>;
    focusedBlock: StoredFocusedPreviewBlock | null;
    activeTab: BuilderTab;
}

interface LegacyCanvasPayload {
    version: number;
    previewBlocks: StoredPreviewBlock[];
    blockOverrides: Record<string, StoredBlockOverrideSettings>;
    focusedBlock: StoredFocusedPreviewBlock | null;
    activeTab: BuilderTab;
}

const DEFAULT_PREVIEW_BLOCKS: StoredPreviewBlock[] = [
    { id: 'launcher-1', type: 'launcher', x: 40, y: 300, width: 220, height: 112 },
    {
        id: 'desktop-modal-1',
        type: 'desktopModal',
        x: 300,
        y: 40,
        width: 520,
        height: 760
    }
];

function isPreviewBlockType(value: unknown): value is PreviewBlockType {
    return typeof value === 'string' && PREVIEW_BLOCK_TYPES.has(value as PreviewBlockType);
}

function parsePreviewMethod(value: unknown): PreviewMethod | undefined {
    return typeof value === 'string' && PREVIEW_METHODS.has(value as PreviewMethod)
        ? (value as PreviewMethod)
        : undefined;
}

function parsePreviewTrigger(value: unknown): PreviewTrigger | undefined {
    return typeof value === 'string' && PREVIEW_TRIGGERS.has(value as PreviewTrigger)
        ? (value as PreviewTrigger)
        : undefined;
}

function parsePreviewMode(value: unknown): PreviewMode | undefined {
    return typeof value === 'string' && PREVIEW_MODES.has(value as PreviewMode)
        ? (value as PreviewMode)
        : undefined;
}

function parseNumber(value: unknown, fallback: number): number {
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function parsePreviewBlock(value: unknown): StoredPreviewBlock | null {
    if (!value || typeof value !== 'object') {
        return null;
    }

    const block = value as Partial<StoredPreviewBlock>;

    if (typeof block.id !== 'string' || !block.id || !isPreviewBlockType(block.type)) {
        return null;
    }

    const previewMode = parsePreviewMode(block.previewMode) ?? 'desktop';
    const method = parsePreviewMethod(block.method);
    const trigger = parsePreviewTrigger(block.trigger);
    const defaults = getPreviewFrameSize(block.type, previewMode, trigger ?? 'before');

    const parsed: StoredPreviewBlock = {
        id: block.id,
        type: block.type,
        x: parseNumber(block.x, 0),
        y: parseNumber(block.y, 0),
        width: parseNumber(block.width, defaults.width),
        height: parseNumber(block.height, defaults.height)
    };

    if (block.type === 'actionModal' || block.type === 'actionNotification') {
        parsed.method = method ?? 'sendTransaction';
        parsed.trigger = trigger ?? 'before';
        parsed.previewMode = previewMode;
    }

    return parsed;
}

function parseFocusedBlock(
    value: unknown,
    previewBlocks: StoredPreviewBlock[]
): StoredFocusedPreviewBlock | null {
    if (!value || typeof value !== 'object') {
        return null;
    }

    const focused = value as Partial<StoredFocusedPreviewBlock>;

    if (typeof focused.id !== 'string' || !isPreviewBlockType(focused.type)) {
        return null;
    }

    const block = previewBlocks.find(item => item.id === focused.id && item.type === focused.type);

    return block ? { id: block.id, type: block.type } : null;
}

function parseBlockOverrides(
    value: unknown,
    previewBlockIds: Set<string>
): Record<string, StoredBlockOverrideSettings> {
    if (!value || typeof value !== 'object') {
        return {};
    }

    const overrides: Record<string, StoredBlockOverrideSettings> = {};

    for (const [blockId, rawOverride] of Object.entries(value)) {
        if (!previewBlockIds.has(blockId) || !rawOverride || typeof rawOverride !== 'object') {
            continue;
        }

        const override = rawOverride as StoredBlockOverrideSettings;
        const nextOverride: StoredBlockOverrideSettings = {};

        if (override.ton && typeof override.ton === 'object') {
            nextOverride.ton = override.ton;
        }

        if (override.builder && typeof override.builder === 'object') {
            nextOverride.builder = override.builder;
        }

        if (nextOverride.ton || nextOverride.builder) {
            overrides[blockId] = nextOverride;
        }
    }

    return overrides;
}

function parseActiveTab(value: unknown): BuilderTab {
    return typeof value === 'string' && BUILDER_TABS.has(value as BuilderTab)
        ? (value as BuilderTab)
        : 'theme';
}

function parseTonSettings(value: unknown): TonConnectSettingsState {
    if (!value || typeof value !== 'object') {
        return DEFAULT_TON_CONNECT_SETTINGS;
    }

    return {
        ...DEFAULT_TON_CONNECT_SETTINGS,
        ...(value as TonConnectSettingsState)
    };
}

function parsePreviewBlocks(value: unknown): StoredPreviewBlock[] | null {
    if (!Array.isArray(value)) {
        return null;
    }

    const previewBlocks = value
        .map(parsePreviewBlock)
        .filter((block): block is StoredPreviewBlock => block !== null);

    return previewBlocks.length > 0 ? previewBlocks : null;
}

function buildPersistedState(
    previewBlocks: StoredPreviewBlock[],
    partial: {
        tonSettings?: unknown;
        builderSettings?: unknown;
        blockOverrides?: unknown;
        focusedBlock?: unknown;
        activeTab?: unknown;
    }
): WidgetBuilderPersistedState {
    const previewBlockIds = new Set(previewBlocks.map(block => block.id));

    return {
        tonSettings: parseTonSettings(partial.tonSettings),
        builderSettings: normalizeWidgetBuilderSettings(partial.builderSettings),
        previewBlocks,
        blockOverrides: parseBlockOverrides(partial.blockOverrides, previewBlockIds),
        focusedBlock: parseFocusedBlock(partial.focusedBlock, previewBlocks),
        activeTab: parseActiveTab(partial.activeTab)
    };
}

export function getDefaultWidgetBuilderState(): WidgetBuilderPersistedState {
    return buildPersistedState(DEFAULT_PREVIEW_BLOCKS, {});
}

function parsePersistedPayload(
    parsed: Partial<PersistedPayload>
): WidgetBuilderPersistedState | null {
    const previewBlocks = parsePreviewBlocks(parsed.previewBlocks);

    if (!previewBlocks) {
        return null;
    }

    return buildPersistedState(previewBlocks, parsed);
}

function loadLegacyCanvasState(): WidgetBuilderPersistedState | null {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        const raw = window.localStorage.getItem(LEGACY_CANVAS_STORAGE_KEY);

        if (!raw) {
            return null;
        }

        const parsed = JSON.parse(raw) as Partial<LegacyCanvasPayload>;

        if (parsed.version !== 1) {
            return null;
        }

        const state = parsePersistedPayload({
            previewBlocks: parsed.previewBlocks,
            blockOverrides: parsed.blockOverrides,
            focusedBlock: parsed.focusedBlock,
            activeTab: parsed.activeTab,
            ...readUrlMigrationPartial()
        });

        if (!state) {
            return null;
        }

        window.localStorage.removeItem(LEGACY_CANVAS_STORAGE_KEY);
        return state;
    } catch {
        return null;
    }
}

function readUrlMigrationPartial(): {
    tonSettings?: TonConnectSettingsState;
    builderSettings?: WidgetBuilderSettings;
} | null {
    if (typeof window === 'undefined') {
        return null;
    }

    const params = new URLSearchParams(window.location.search);
    const hasWidgetBuilderParams = [
        'wbManifest',
        'wbContainer',
        'wbLabel',
        'wbWidth',
        'wbHeight',
        'wbFull',
        'wbCss'
    ].some(key => params.has(key));
    const hasTonSettingsParams = [
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
    ].some(key => params.has(key));

    if (!hasWidgetBuilderParams && !hasTonSettingsParams) {
        return null;
    }

    return {
        tonSettings: hasTonSettingsParams ? parseSettingsFromSearchParams(params) : undefined,
        builderSettings: hasWidgetBuilderParams
            ? parseWidgetBuilderSettingsFromSearchParams(params)
            : undefined
    };
}

function migrateFromUrl(): WidgetBuilderPersistedState | null {
    const urlPartial = readUrlMigrationPartial();

    if (!urlPartial) {
        return null;
    }

    return buildPersistedState(DEFAULT_PREVIEW_BLOCKS, urlPartial);
}

export function loadWidgetBuilderState(): WidgetBuilderPersistedState | null {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);

        if (raw) {
            const parsed = JSON.parse(raw) as Partial<PersistedPayload>;

            if (parsed.version === STORAGE_VERSION || parsed.version === 2) {
                const state = parsePersistedPayload(parsed);

                if (state) {
                    return state;
                }
            }
        }
    } catch {
        // Fall through to migration paths.
    }

    const legacyState = loadLegacyCanvasState();

    if (legacyState) {
        saveWidgetBuilderState(legacyState);
        return legacyState;
    }

    const migratedFromUrl = migrateFromUrl();

    if (migratedFromUrl) {
        saveWidgetBuilderState(migratedFromUrl);
        return migratedFromUrl;
    }

    return null;
}

export function saveWidgetBuilderState(state: WidgetBuilderPersistedState): void {
    if (typeof window === 'undefined') {
        return;
    }

    const payload: PersistedPayload = {
        version: STORAGE_VERSION,
        tonSettings: state.tonSettings,
        builderSettings: state.builderSettings,
        previewBlocks: state.previewBlocks,
        blockOverrides: state.blockOverrides,
        focusedBlock: state.focusedBlock,
        activeTab: state.activeTab
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function clearWidgetBuilderState(): void {
    if (typeof window === 'undefined') {
        return;
    }

    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_CANVAS_STORAGE_KEY);
}
