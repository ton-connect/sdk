import { Link } from 'react-router-dom';
import { TonConnectButton } from '@tonconnect/ui-react';
import { NetworkPicker } from '../NetworkPicker/NetworkPicker';
import './header.scss';

export const Header = () => {
    return (
        <header>
            <span>My App with React UI</span>
            <div className="header__controls">
                <Link to="/intents-showcase" className="header__link">
                    Intents Showcase
                </Link>
                <NetworkPicker />
                <TonConnectButton />
            </div>
        </header>
    );
};
