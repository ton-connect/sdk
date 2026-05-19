/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { createContext, useEffect, useMemo, useState } from 'react';

type Theme = 'dark' | 'light';
type ThemeOption = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
    children: React.ReactNode;
    defaultTheme?: ThemeOption;
    storageKey?: string;
};

type ThemeProviderState = {
    theme: ThemeOption;
    calculatedTheme: Theme;
    setTheme: (theme: ThemeOption) => void;
};

const initialState: ThemeProviderState = {
    theme: 'system',
    calculatedTheme: 'light',
    setTheme: () => null,
};

export const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export const ThemeProvider = ({
    children,
    defaultTheme = 'system',
    storageKey = 'vite-ui-theme',
    ...props
}: ThemeProviderProps) => {
    const [theme, setTheme] = useState<ThemeOption>(() => {
        return (localStorage.getItem(storageKey) as ThemeOption) || defaultTheme;
    });
    const calculatedTheme: Theme = useMemo(() => {
        return theme === 'system'
            ? window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light'
            : theme === 'dark'
              ? 'dark'
              : 'light';
    }, [theme]);

    useEffect(() => {
        const root = window.document.documentElement;
        const resolved: Theme =
            theme === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme;

        root.classList.remove('light', 'dark');
        root.classList.add(resolved);
        root.setAttribute('data-theme', resolved);
        root.setAttribute('data-ta-theme', resolved);
    }, [theme]);

    const value = {
        theme,
        calculatedTheme,
        setTheme: (theme: ThemeOption) => {
            localStorage.setItem(storageKey, theme);
            setTheme(theme);
        },
    };

    return (
        <ThemeProviderContext.Provider value={value} {...props}>
            {children}
        </ThemeProviderContext.Provider>
    );
};
