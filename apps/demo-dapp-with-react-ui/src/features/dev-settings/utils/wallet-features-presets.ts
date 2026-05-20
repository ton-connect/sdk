import type { RequiredFeatures } from '@tonconnect/sdk';

export const WALLET_FEATURES_PRESET_IDS = [
    'sign-data',
    'extra-currency',
    'min-messages-2',
    'embedded-request'
] as const;

export type WalletFeaturesPresetId = (typeof WALLET_FEATURES_PRESET_IDS)[number];

export const WALLET_FEATURES_PRESETS: {
    id: WalletFeaturesPresetId;
    label: string;
    features: RequiredFeatures;
}[] = [
    {
        id: 'sign-data',
        label: 'Sign data (text, binary, cell)',
        features: { signData: { types: ['text', 'binary', 'cell'] } }
    },
    {
        id: 'extra-currency',
        label: 'Extra currency on send',
        features: { sendTransaction: { extraCurrencyRequired: true } }
    },
    {
        id: 'min-messages-2',
        label: 'Min 2 messages on send',
        features: { sendTransaction: { minMessages: 2 } }
    },
    {
        id: 'embedded-request',
        label: 'Embedded request',
        features: { embeddedRequest: {} }
    }
];

const PRESET_BY_ID = Object.fromEntries(
    WALLET_FEATURES_PRESETS.map(preset => [preset.id, preset])
) as Record<WalletFeaturesPresetId, (typeof WALLET_FEATURES_PRESETS)[number]>;

export function parseWalletFeaturesPresets(value: string | null): WalletFeaturesPresetId[] {
    if (!value?.trim()) {
        return [];
    }
    return value
        .split(',')
        .map(item => item.trim())
        .filter((item): item is WalletFeaturesPresetId =>
            WALLET_FEATURES_PRESET_IDS.includes(item as WalletFeaturesPresetId)
        );
}

export function serializeWalletFeaturesPresets(ids: WalletFeaturesPresetId[]): string {
    return ids.join(',');
}

function mergeSendTransaction(
    a: RequiredFeatures['sendTransaction'],
    b: RequiredFeatures['sendTransaction']
): RequiredFeatures['sendTransaction'] {
    if (!a) {
        return b;
    }
    if (!b) {
        return a;
    }
    return {
        minMessages: Math.max(a.minMessages ?? 0, b.minMessages ?? 0) || undefined,
        extraCurrencyRequired: a.extraCurrencyRequired || b.extraCurrencyRequired
    };
}

export function walletFeaturesPresetsToRequiredFeatures(
    ids: WalletFeaturesPresetId[]
): RequiredFeatures | undefined {
    if (ids.length === 0) {
        return undefined;
    }

    const result: RequiredFeatures = {};

    for (const id of ids) {
        const { features } = PRESET_BY_ID[id];
        if (features.sendTransaction) {
            result.sendTransaction = mergeSendTransaction(
                result.sendTransaction,
                features.sendTransaction
            );
        }
        if (features.signData) {
            result.signData = features.signData;
        }
        if (features.embeddedRequest) {
            result.embeddedRequest = features.embeddedRequest;
        }
    }

    return result;
}
