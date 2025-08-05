import {ColorsSet, THEME, useTonConnectUI} from "@tonconnect/ui-react";
import {FunctionComponent, useEffect, useState} from "react";
import './style.scss';

const defaultColors = {
    [THEME.LIGHT]: {
        constant: {
            black: '#000000',
            white: '#FFFFFF'
        },
        connectButton: {
            background: '#0098EA',
            foreground: '#FFFFFF'
        },
        accent: '#0098EA',
        telegramButton: '#0098EA',
        icon: {
            primary: '#0F0F0F',
            secondary: '#7A8999',
            tertiary: '#C1CAD2',
            success: '#29CC6A',
            error: '#F5A73B'
        },
        background: {
            primary: '#FFFFFF',
            secondary: '#F1F3F5',
            segment: '#FFFFFF',
            tint: '#F1F3F5',
            qr: '#F1F3F5'
        },
        text: {
            primary: '#0F0F0F',
            secondary: '#6A7785'
        }
    },
    [THEME.DARK]: {
        constant: {
            black: '#000000',
            white: '#FFFFFF'
        },
        connectButton: {
            background: '#0098EA',
            foreground: '#FFFFFF'
        },
        accent: '#E5E5EA',
        telegramButton: '#31A6F5',
        icon: {
            primary: '#E5E5EA',
            secondary: '#909099',
            tertiary: '#434347',
            success: '#29CC6A',
            error: '#F5A73B'
        },
        background: {
            primary: '#121214',
            secondary: '#18181A',
            segment: '#262629',
            tint: '#222224',
            qr: '#F1F3F5'
        },
        text: {
            primary: '#E5E5EA',
            secondary: '#7D7D85'
        }
    }
}

export interface ColorsSelectProps {
    theme: THEME;
}
export const ColorsSelect: FunctionComponent<ColorsSelectProps> = ({ theme }) => {
    const [_, setOptions] = useTonConnectUI();
    const [colors, setColors] = useState<ColorsSet>(defaultColors[theme]);

    useEffect(() => {
        setColors(defaultColors[theme]);
    }, [theme]);

    const onChange = (value: string, property1: string, property2?: string) => {
        setOptions({
            uiPreferences: {
                colorsSet: {
                    [theme]: {
                        [property1]: property2 ? {
                            ...(colors as any)[property1],
                            [property2]: value
                        } : value
                    }
                }
            }
        })


        setColors(colors => ({
            ...colors,
            [property1]: property2 ? {
                ...(colors as any)[property1],
                [property2]: value
            } : value
        }));

        defaultColors[theme] = {
            ...defaultColors[theme],
            [property1]: property2 ? {
                ...(colors as any)[property1],
                [property2]: value
            } : value
        }
    }

    return <div  className="colors-container">
        { Object.entries(colors).map(([key1, value1]) => {
            if (typeof value1 === 'object') {
                return <div key={key1}>
                    <span>{key1}:</span>
                    {
                        Object.entries(value1).map(([key2, value2]) =>
                            <label key={key1 + key2}>
                                { key2 }
                                <input
                                    type="color"
                                    value={(colors as any)[key1][key2]}
                                    onChange={e => onChange(e.target.value, key1, key2)}
                                />
                            </label>
                        )
                    }

                </div>
            }

            return <div>
                <span>{key1}:</span>
                <label>
                    <input
                        type="color"
                        value={(colors as any)[key1]}
                        onChange={e => onChange(e.target.value, key1)}
                    />
                </label>
            </div>

          })
        }
    </div>
}
