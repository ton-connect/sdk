import type { ColorsSet, Theme } from '@tonconnect/ui-react';
import { THEME, useTonConnectUI } from '@tonconnect/ui-react';
import { Palette, RotateCcw } from 'lucide-react';
import { useState } from 'react';

import { Button } from '../../../core/components/ui/button/index';
import { Modal } from '../../../core/components/ui/modal/index';
import { cn } from '../../../core/lib/utils';
import { getDefaultColorsForTheme } from '../lib/default-colors';
import { ColorsSelect } from './colors-select';

interface ColorsModalProps {
    colorsSet?: Partial<Record<Theme, ColorsSet>>;
    onColorsSetChange: (colorsSet: Partial<Record<Theme, ColorsSet>>) => void;
}

const THEME_TABS: { id: Theme; label: string }[] = [
    { id: THEME.DARK, label: 'Dark' },
    { id: THEME.LIGHT, label: 'Light' }
];

export const ColorsModal = ({ colorsSet, onColorsSetChange }: ColorsModalProps) => {
    const [, setOptions] = useTonConnectUI();
    const [opened, setOpened] = useState(false);
    const [activeTheme, setActiveTheme] = useState<Theme>(THEME.DARK);

    const resetThemeColors = () => {
        const defaults = getDefaultColorsForTheme(activeTheme);
        setOptions({
            uiPreferences: {
                colorsSet: {
                    [activeTheme]: defaults
                }
            }
        });
        onColorsSetChange({
            ...colorsSet,
            [activeTheme]: defaults
        });
    };

    return (
        <>
            <Button type="button" variant="secondary" onClick={() => setOpened(true)}>
                <Palette size={16} />
                Customize colors
            </Button>

            <Modal
                open={opened}
                onOpenChange={setOpened}
                title="Color palette"
                className="!max-w-2xl"
                bodyClassName="!px-5 !pb-5"
            >
                <p className="-mt-1 mb-4 text-sm leading-relaxed text-secondary-foreground">
                    Tune TonConnect UI tokens for light and dark themes. Changes apply live and sync
                    to the URL.
                </p>

                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div
                        className="inline-flex rounded-xl bg-secondary p-1"
                        role="tablist"
                        aria-label="Theme"
                    >
                        {THEME_TABS.map(({ id, label }) => (
                            <button
                                key={id}
                                type="button"
                                role="tab"
                                aria-selected={activeTheme === id}
                                onClick={() => setActiveTheme(id)}
                                className={cn(
                                    'min-w-[5.5rem] rounded-lg px-4 py-2 text-sm font-medium transition-all',
                                    activeTheme === id
                                        ? 'bg-background text-foreground shadow-sm'
                                        : 'text-secondary-foreground hover:text-foreground'
                                )}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <Button type="button" variant="ghost" size="s" onClick={resetThemeColors}>
                        <RotateCcw size={14} />
                        Reset {activeTheme === THEME.LIGHT ? 'light' : 'dark'}
                    </Button>
                </div>

                <div className="max-h-[min(52vh,28rem)] overflow-y-auto pr-1">
                    <ColorsSelect
                        theme={activeTheme}
                        colorsSet={colorsSet}
                        onColorsSetChange={onColorsSetChange}
                    />
                </div>
            </Modal>
        </>
    );
};
