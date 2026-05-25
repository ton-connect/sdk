import type { ColorsSet, Theme } from '@tonconnect/ui-react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { FunctionComponent, useEffect, useState } from 'react';

import { getDefaultColorsForTheme } from '../../../utils/default-colors';
import { ColorField } from './color-field';

export interface ColorsSelectProps {
    theme: Theme;
    colorsSet?: Partial<Record<Theme, ColorsSet>>;
    onColorsSetChange: (colorsSet: Partial<Record<Theme, ColorsSet>>) => void;
}

const SECTION_ORDER = [
    'connectButton',
    'accent',
    'telegramButton',
    'text',
    'background',
    'icon',
    'constant'
] as const;

type SectionKey = (typeof SECTION_ORDER)[number];

type ColorFieldEntry = {
    sectionKey: SectionKey;
    nestedKey?: string;
    value: string;
};

const SECTION_LABELS: Record<string, string> = {
    connectButton: 'Connect button',
    accent: 'Accent',
    telegramButton: 'Telegram button',
    text: 'Text',
    background: 'Background',
    icon: 'Icons',
    constant: 'Constants'
};

const TOKEN_LABELS: Record<string, string> = {
    background: 'Background',
    foreground: 'Foreground',
    primary: 'Primary',
    secondary: 'Secondary',
    tertiary: 'Tertiary',
    segment: 'Segment',
    tint: 'Tint',
    qr: 'QR',
    success: 'Success',
    error: 'Error',
    black: 'Black',
    white: 'White'
};

function formatTokenLabel(key: string): string {
    return TOKEN_LABELS[key] ?? key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase());
}

export const ColorsSelect: FunctionComponent<ColorsSelectProps> = ({
    theme,
    colorsSet,
    onColorsSetChange
}) => {
    const [, setOptions] = useTonConnectUI();
    const [colors, setColors] = useState<ColorsSet>(
        () => colorsSet?.[theme] ?? getDefaultColorsForTheme(theme)
    );

    useEffect(() => {
        setColors(colorsSet?.[theme] ?? getDefaultColorsForTheme(theme));
    }, [theme, colorsSet]);

    const commitColors = (nextColors: ColorsSet) => {
        setOptions({
            uiPreferences: {
                colorsSet: {
                    [theme]: nextColors
                }
            }
        });

        setColors(nextColors);
        onColorsSetChange({
            ...colorsSet,
            [theme]: nextColors
        });
    };

    const onChange = (value: string, property1: string, property2?: string) => {
        const nextColors: ColorsSet = {
            ...colors,
            [property1]: property2
                ? {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      ...(colors as any)[property1],
                      [property2]: value
                  }
                : value
        };
        commitColors(nextColors);
    };

    const entries: ColorFieldEntry[] = SECTION_ORDER.flatMap((sectionKey): ColorFieldEntry[] => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sectionValue = (colors as any)[sectionKey];
        if (sectionValue === undefined) {
            return [];
        }

        if (typeof sectionValue === 'object') {
            return Object.keys(sectionValue).map(nestedKey => ({
                sectionKey,
                nestedKey,
                value: sectionValue[nestedKey] as string
            }));
        }

        return [{ sectionKey, value: sectionValue as string }];
    });

    const sections = SECTION_ORDER.map(sectionKey => {
        const fields = entries.filter(entry => entry.sectionKey === sectionKey);
        if (fields.length === 0) {
            return null;
        }

        return (
            <section key={sectionKey} className="flex flex-col gap-2.5">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary-foreground">
                    {SECTION_LABELS[sectionKey] ?? sectionKey}
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                    {fields.map(field => (
                        <ColorField
                            key={`${field.sectionKey}-${field.nestedKey ?? 'value'}`}
                            label={
                                field.nestedKey
                                    ? formatTokenLabel(field.nestedKey)
                                    : formatTokenLabel(field.sectionKey)
                            }
                            value={field.value}
                            onChange={value => onChange(value, field.sectionKey, field.nestedKey)}
                        />
                    ))}
                </div>
            </section>
        );
    });

    return <div className="flex flex-col gap-5">{sections}</div>;
};
