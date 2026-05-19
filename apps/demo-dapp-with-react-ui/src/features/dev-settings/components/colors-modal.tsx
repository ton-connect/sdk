import { THEME } from '@tonconnect/ui-react';
import { useState } from 'react';

import { Button } from '@/core/components/ui/button';
import { Modal } from '@/core/components/ui/modal';
import { ColorsSelect } from './colors-select';

export const ColorsModal = () => {
    const [opened, setOpened] = useState(false);
    const [theme, setTheme] = useState(THEME.LIGHT);

    return (
        <>
            <Button variant="secondary" onClick={() => setOpened(true)}>
                change colors
            </Button>
            <Modal open={opened} onOpenChange={setOpened} title="Customize colors">
                <div className="mb-5 flex justify-center gap-5">
                    <button
                        type="button"
                        onClick={() => setTheme(THEME.LIGHT)}
                        className={`bg-transparent text-sm font-semibold underline-offset-4 ${
                            theme === THEME.LIGHT
                                ? 'text-primary underline'
                                : 'text-foreground/70'
                        }`}
                    >
                        LIGHT
                    </button>
                    <button
                        type="button"
                        onClick={() => setTheme(THEME.DARK)}
                        className={`bg-transparent text-sm font-semibold underline-offset-4 ${
                            theme === THEME.DARK
                                ? 'text-primary underline'
                                : 'text-foreground/70'
                        }`}
                    >
                        DARK
                    </button>
                </div>
                <ColorsSelect theme={theme} />
            </Modal>
        </>
    );
};
