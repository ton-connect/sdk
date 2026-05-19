import { useContext, useEffect } from 'react';
import { THEME, useTonConnectUI } from '@tonconnect/ui-react';

import { ThemeProviderContext } from '@/core/components/layout/theme-provider';

export const useTheme = () => {
    const context = useContext(ThemeProviderContext);
    const [tonconnect] = useTonConnectUI();

    if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');

    useEffect(() => {
        if (!tonconnect) return;
        tonconnect.uiOptions = {
            uiPreferences: {
                theme: context.calculatedTheme === 'dark' ? THEME.DARK : THEME.LIGHT
            }
        };
    }, [context.calculatedTheme, tonconnect]);

    return context;
};
