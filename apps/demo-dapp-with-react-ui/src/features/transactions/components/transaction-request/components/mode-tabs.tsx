import { Select } from '@/core/components/ui/select';
import { ChevronDownIcon } from '@/core/components/ui/icons';
import { cn } from '@/core/lib/utils';

import type { PresetKey } from '../../../lib/transaction-presets';

export type EditorMode = 'form' | 'raw';

export interface PresetOption {
    id: PresetKey;
    name: string;
    description: string;
}

interface ModeTabsProps {
    mode: EditorMode;
    onModeChange: (next: EditorMode) => void;
    presetOptions: readonly PresetOption[];
    selectedPreset: PresetKey | '';
    onPresetSelect: (key: PresetKey) => void;
}

const tabBtnCls = (active: boolean) =>
    cn(
        'cursor-pointer rounded-md px-3 py-1 text-sm font-medium transition-colors',
        active
            ? 'bg-background text-foreground shadow-sm'
            : 'text-secondary-foreground hover:text-foreground'
    );

export function ModeTabs({
    mode,
    onModeChange,
    presetOptions,
    selectedPreset,
    onPresetSelect
}: ModeTabsProps) {
    const selectedName = selectedPreset
        ? presetOptions.find(p => p.id === selectedPreset)?.name
        : 'Load a preset';

    return (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex rounded-lg bg-secondary p-1">
                <button
                    type="button"
                    className={tabBtnCls(mode === 'form')}
                    onClick={() => onModeChange('form')}
                >
                    Form
                </button>
                <button
                    type="button"
                    className={tabBtnCls(mode === 'raw')}
                    onClick={() => onModeChange('raw')}
                >
                    Raw
                </button>
            </div>

            <Select.Root value={selectedPreset} onValueChange={v => onPresetSelect(v as PresetKey)}>
                <Select.Trigger variant="gray" size="s" borderRadius="l">
                    {selectedName}
                    <ChevronDownIcon size={16} />
                </Select.Trigger>
                <Select.Content>
                    {presetOptions.map(opt => (
                        <Select.Item key={opt.id} value={opt.id}>
                            <div className="flex flex-col">
                                <span className="font-medium">{opt.name}</span>
                                <span className="text-xs text-secondary-foreground">
                                    {opt.description}
                                </span>
                            </div>
                        </Select.Item>
                    ))}
                </Select.Content>
            </Select.Root>
        </div>
    );
}
