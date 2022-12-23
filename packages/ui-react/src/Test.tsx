import { FunctionComponent, useState } from 'react';
import TonConnectButton from './components/TonConnectButton';
import { useTonAddress } from './hooks/useTonAddress';
import { Locales, THEME } from '@tonconnect/ui';
import { useTonConnectUI } from './hooks/useTonConnectUI';

const Test: FunctionComponent = () => {
    const [theme, setTheme] = useState(THEME.DARK);
    const address = useTonAddress();
    const [_, setOptions] = useTonConnectUI();

    const onThemeChange = (): void => {
        const changeTo = theme === THEME.DARK ? THEME.LIGHT : THEME.DARK;
        setOptions({ theme: changeTo });
        setTheme(changeTo);
    };

    const onLangChange = (language: Locales): void => {
        setOptions({ language });
    };

    return (
        <div>
            <TonConnectButton style={{ margin: '20px', float: 'right' }} />
            <br />
            {address && <div>Address: {address}</div>}
            <br />
            <button onClick={onThemeChange}>
                change theme to {theme === THEME.DARK ? 'light' : 'dark'}
            </button>
            <br />
            <button onClick={() => onLangChange('ru')}>ru lang</button>
            <button onClick={() => onLangChange('en')}>en lang</button>
        </div>
    );
};

export default Test;
