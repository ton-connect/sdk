import { TonConnectButton } from '@tonconnect/ui-react';
import { Link } from 'react-router-dom';
import { NetworkPicker } from '../NetworkPicker/NetworkPicker';
import './header.scss';

export const Header = () => {
    return (
        <header>
            <span>My App with React UI</span>
            <div className="header__controls">
                <Link
                    to="/pay"
                    style={{
                        padding: '8px 14px',
                        borderRadius: 12,
                        background: 'linear-gradient(135deg,#0098EA,#0078be)',
                        color: '#fff',
                        textDecoration: 'none',
                        fontWeight: 600,
                        fontSize: 13
                    }}
                >
                    One-click pay demo →
                </Link>
                <NetworkPicker />
                <TonConnectButton />
            </div>
        </header>
    );
};
