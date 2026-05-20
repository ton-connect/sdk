import type { ColorsSet, Theme } from '@tonconnect/ui-react';
import { THEME, useTonConnectUI } from '@tonconnect/ui-react';
import { Palette, RotateCcw } from 'lucide-react';
import { useState } from 'react';

import { Button } from '../../../../../core/components/ui/button';
import { Modal } from '../../../../../core/components/ui/modal';
import { Tabs } from '../../../../../core/components/ui/tabs';
import { getDefaultColorsForTheme } from '../../../utils/default-colors';
import { ColorsSelect } from './colors-select';

interface ColorsModalProps {
    colorsSet?: Partial<Record<Theme, ColorsSet>>;
    onColorsSetChange: (colorsSet: Partial<Record<Theme, ColorsSet>>) => void;
    /** Controlled open state — use with `onOpenChange` for external triggers. */
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** Hide the built-in opener when using external buttons (toolbar + card). */
    hideDefaultTrigger?: boolean;
}

const THEME_TABS: { id: Theme; label: string }[] = [
    { id: THEME.DARK, label: 'Dark' },
    { id: THEME.LIGHT, label: 'Light' }
];

export const ColorsModal = ({
    colorsSet,
    onColorsSetChange,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
    hideDefaultTrigger = false
}: ColorsModalProps) => {
    const [, setOptions] = useTonConnectUI();
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = controlledOpen !== undefined && controlledOnOpenChange !== undefined;
    const opened = isControlled ? controlledOpen : internalOpen;
    const setOpened = isControlled ? controlledOnOpenChange : setInternalOpen;
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
            {!hideDefaultTrigger ? (
                <Button type="button" variant="secondary" onClick={() => setOpened(true)}>
                    <Palette size={16} />
                    Customize colors
                </Button>
            ) : null}

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
                    <Tabs
                        value={activeTheme}
                        onValueChange={v => setActiveTheme(v as Theme)}
                        aria-label="Theme"
                    >
                        <Tabs.List className="rounded-xl">
                            {THEME_TABS.map(({ id, label }) => (
                                <Tabs.Trigger
                                    key={id}
                                    value={id}
                                    className="min-w-[5.5rem] rounded-lg px-4 py-2"
                                >
                                    {label}
                                </Tabs.Trigger>
                            ))}
                        </Tabs.List>
                    </Tabs>

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
