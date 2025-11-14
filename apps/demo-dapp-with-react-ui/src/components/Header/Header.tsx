import { TonConnectButton } from '@tonconnect/ui-react';
import { NetworkPicker } from '../NetworkPicker/NetworkPicker';
import './header.scss';

export const Header = () => {
    return (
        <header>
            <span>My App with React UI</span>
            <div className="header__controls">
                <NetworkPicker />
                <TonConnectButton />
            </div>
        </header>
    );
};
