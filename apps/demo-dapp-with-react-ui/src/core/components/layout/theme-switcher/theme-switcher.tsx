import { Moon, Sun } from 'lucide-react';

import { Button } from '@/core/components/ui/button';
import { useTheme } from '@/core/hooks/use-theme';

export const ThemeSwitcher = () => {
    const { calculatedTheme, setTheme } = useTheme();

    return (
        <Button
            size="icon"
            variant="ghost"
            onClick={() => setTheme(calculatedTheme === 'light' ? 'dark' : 'light')}
        >
            {calculatedTheme === 'light' ? (
                <Sun className="h-[1.2rem] w-[1.2rem]" />
            ) : (
                <Moon className="h-[1.2rem] w-[1.2rem]" />
            )}
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
};
