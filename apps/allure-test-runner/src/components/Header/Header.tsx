import { TonConnectButton } from '@tonconnect/ui-react';
import './Header.scss';

export function Header() {
    return (
        <header className="header">
            <div className="header-content">
                <div className="flex items-center gap-3">
                    <div>
                        <h1 className="brand-title">Allure TestOps Runner</h1>
                    </div>
                </div>
                <TonConnectButton />
            </div>
        </header>
    );
}
