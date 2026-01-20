import { TonConnectButton } from '@tonconnect/ui-react';
import { NetworkPicker } from '../NetworkPicker/NetworkPicker';
import { Link } from 'react-router-dom';
import './header.scss';

export const Header = () => {
    return (
        <header>
            <div className="header__title">
                <Link to="/">My App with React UI</Link>
            </div>
            <div className="header__controls">
                <Link to="/intents-url-demo" className="header__link">
                    Intent URL Builder
                </Link>
                <NetworkPicker />
                <TonConnectButton />
            </div>
        </header>
    );
};
