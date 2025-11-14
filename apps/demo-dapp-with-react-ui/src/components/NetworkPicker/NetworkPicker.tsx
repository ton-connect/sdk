import { useState, useEffect } from 'react';
import { useTonConnectUI, CHAIN } from '@tonconnect/ui-react';
import './style.scss';

export function NetworkPicker() {
    const [tonConnectUI] = useTonConnectUI();
    const [desired, setDesired] = useState<string | undefined>(undefined);

    useEffect(() => {
        tonConnectUI.setConnectRequestParameters(
            desired
                ? {
                      state: 'ready',
                      value: { network: desired }
                  }
                : null
        );
    }, [desired, tonConnectUI]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setDesired(value === '' ? undefined : value);
    };

    return (
        <select className="network-picker" value={desired || ''} onChange={handleChange}>
            <option value="">Any Network</option>
            <option value={CHAIN.MAINNET}>Mainnet</option>
            <option value={CHAIN.TESTNET}>Testnet</option>
        </select>
    );
}
