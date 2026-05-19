import { useState } from 'react';
import { FileText, RotateCcw } from 'lucide-react';

import { Button } from '@/core/components/ui/button';
import { Modal } from '@/core/components/ui/modal';
import { Tabs } from '@/core/components/ui/tabs';
import { useIsMobile } from '@/core/hooks/use-mobile';
import { cn } from '@/core/lib/utils';

import type { PresetKey } from '../../../lib/transaction-presets';

export type EditorMode = 'form' | 'json';

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
    onReset: () => void;
}

export function ModeTabs({
    mode,
    onModeChange,
    presetOptions,
    selectedPreset,
    onPresetSelect,
    onReset
}: ModeTabsProps) {
    const [presetsOpen, setPresetsOpen] = useState(false);
    const isMobile = useIsMobile();

    const choosePreset = (key: PresetKey) => {
        onPresetSelect(key);
        setPresetsOpen(false);
    };

    return (
        <div className="flex flex-wrap items-center justify-between gap-2">
            <Tabs
                className="w-full md:w-auto"
                value={mode}
                onValueChange={v => onModeChange(v as EditorMode)}
            >
                <Tabs.List className="w-full gap-1 md:w-auto">
                    <Tabs.Trigger
                        value="form"
                        className="flex-1 font-medium md:flex-initial md:min-w-24"
                    >
                        Form
                    </Tabs.Trigger>
                    <Tabs.Trigger
                        value="json"
                        className="flex-1 font-medium md:flex-initial md:min-w-24"
                    >
                        JSON
                    </Tabs.Trigger>
                </Tabs.List>
            </Tabs>

            <div className="flex w-full flex-col-reverse gap-2 md:w-auto md:flex-row md:items-center">
                <Button
                    variant={isMobile ? 'bezeled' : 'ghost'}
                    size="s"
                    borderRadius={isMobile ? 'l' : undefined}
                    onClick={onReset}
                    fullWidth={isMobile}
                >
                    <RotateCcw className="size-3.5" />
                    Reset
                </Button>

                <Button
                    variant="secondary"
                    size="s"
                    borderRadius={isMobile ? 'l' : undefined}
                    onClick={() => setPresetsOpen(true)}
                    fullWidth={isMobile}
                >
                    <FileText className="size-3.5" />
                    Presets
                </Button>
            </div>

            <Modal open={presetsOpen} onOpenChange={setPresetsOpen} title="Load a preset">
                <p className="mb-4 text-sm leading-relaxed text-secondary-foreground">
                    Replace the current form with a ready-made transaction-request example.
                </p>
                <div className="flex flex-col gap-2">
                    {presetOptions.map(opt => {
                        const active = opt.id === selectedPreset;
                        return (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => choosePreset(opt.id)}
                                className={cn(
                                    'flex flex-col gap-1 rounded-lg border p-3 text-left transition-colors',
                                    active
                                        ? 'border-primary bg-primary/10'
                                        : 'border-tertiary bg-secondary/40 hover:border-primary/40 hover:bg-secondary'
                                )}
                            >
                                <span
                                    className={cn(
                                        'text-sm font-semibold',
                                        active ? 'text-primary' : 'text-foreground'
                                    )}
                                >
                                    {opt.name}
                                </span>
                                <span className="text-xs text-secondary-foreground">
                                    {opt.description}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </Modal>
        </div>
    );
}
