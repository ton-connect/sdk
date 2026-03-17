import { TonConnectButton } from '@tonconnect/ui-react';
import { useEffect, useState } from 'react';
import { NetworkPicker } from '../NetworkPicker/NetworkPicker';
import './header.scss';
import { useQueryState } from '../../hooks/useQueryState';
import { TonProofDemoApi } from '../../TonProofDemoApi';

export const Header = () => {
    const [useLegacySignQuery, setUseLegacySignQuery] = useQueryState('useLegacySign');
    const [useLegacySign, setUseLegacySign] = useState<boolean>(
        useLegacySignQuery === '1' || useLegacySignQuery === 'true'
    );

    useEffect(() => {
        setUseLegacySign(useLegacySignQuery === '1' || useLegacySignQuery === 'true');
    }, [useLegacySignQuery]);

    useEffect(() => {
        void TonProofDemoApi.setSignerMode(useLegacySign);
    }, [useLegacySign]);

    const handleToggleLegacySign = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setUseLegacySign(checked);
        setUseLegacySignQuery(checked ? '1' : '');
    };

    return (
        <header>
            <span>My App with React UI</span>
            <div className="header__controls">
                <label className="header__legacy-toggle">
                    <span className="header__legacy-label">Use legacy sign</span>
                    <input
                        type="checkbox"
                        className="header__legacy-input"
                        checked={useLegacySign}
                        onChange={handleToggleLegacySign}
                    />
                    <span className="header__legacy-switch" aria-hidden="true">
                        <span className="header__legacy-switch-thumb" />
                    </span>
                </label>
                <NetworkPicker />
                <TonConnectButton />
            </div>
        </header>
    );
};
