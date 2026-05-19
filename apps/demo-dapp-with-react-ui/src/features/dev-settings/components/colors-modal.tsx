import { THEME } from '@tonconnect/ui-react';
import { useState } from 'react';
import { ColorsSelect } from './colors-select';

export const ColorsModal = () => {
    const [opened, setOpened] = useState(false);
    const [theme, setTheme] = useState(THEME.LIGHT);

    return (
        <>
            <button onClick={() => setOpened(true)}>change colors</button>
            {opened && (
                <div className="fixed inset-0 z-[10000000] bg-[rgb(16,22,31)] p-5 text-white [&>button]:float-right">
                    <button onClick={() => setOpened(false)}>close</button>
                    <div className="flex justify-center gap-5 [&>a]:text-white">
                        <a
                            href="#"
                            style={{ color: theme === THEME.LIGHT ? 'blue' : 'white' }}
                            onClick={() => setTheme(THEME.LIGHT)}
                        >
                            LIGHT
                        </a>
                        <a
                            href="#"
                            style={{ color: theme === THEME.DARK ? 'blue' : 'white' }}
                            onClick={() => setTheme(THEME.DARK)}
                        >
                            DARK
                        </a>
                    </div>

                    <ColorsSelect theme={theme} />
                </div>
            )}
        </>
    );
};
