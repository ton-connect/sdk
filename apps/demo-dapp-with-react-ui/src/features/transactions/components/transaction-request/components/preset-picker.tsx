import { useState } from 'react';
import { FileText } from 'lucide-react';

import { Button } from '../../../../../core/components/ui/button';
import { Modal } from '../../../../../core/components/ui/modal';
import { useIsMobile } from '../../../../../core/hooks/use-mobile';
import { cn } from '../../../../../core/lib/utils';

import { PRESETS, type PresetKey } from '../../../lib/transaction-presets';

interface PresetPickerProps {
    onSelect: (key: PresetKey) => void;
}

export const PresetPicker = ({ onSelect }: PresetPickerProps) => {
    const [open, setOpen] = useState(false);
    const isMobile = useIsMobile();

    const choose = (key: PresetKey) => {
        onSelect(key);
        setOpen(false);
    };

    return (
        <>
            <Button
                variant="secondary"
                size="s"
                borderRadius={isMobile ? 'l' : undefined}
                onClick={() => setOpen(true)}
                fullWidth={isMobile}
                data-testid="tx-request-presets-button"
            >
                <FileText className="size-3.5" />
                Presets
            </Button>

            <Modal open={open} onOpenChange={setOpen} title="Load a preset">
                <p className="mb-4 text-sm leading-relaxed text-secondary-foreground">
                    Replace the current request with a ready-made example.
                </p>
                <div className="flex flex-col gap-2" data-testid="tx-request-presets-list">
                    {PRESETS.map(opt => (
                        <button
                            key={opt.id}
                            type="button"
                            onClick={() => choose(opt.id)}
                            className={cn(
                                'flex flex-col gap-1 rounded-lg border p-3 text-left transition-colors',
                                'border-tertiary bg-secondary/40 hover:border-primary/40 hover:bg-secondary'
                            )}
                            data-testid={`tx-request-presets-card-${opt.id}`}
                        >
                            <span className="text-sm font-semibold text-foreground">
                                {opt.name}
                            </span>
                            <span className="text-xs text-secondary-foreground">
                                {opt.description}
                            </span>
                        </button>
                    ))}
                </div>
            </Modal>
        </>
    );
};
