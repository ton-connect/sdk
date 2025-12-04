import { useState, useEffect } from 'react';
import { useTonConnectUI, useTonWallet, CHAIN } from '@tonconnect/ui-react';
import './style.scss';

export function NetworkPicker() {
    const [tonConnectUI] = useTonConnectUI();
    const wallet = useTonWallet();
    const [desired, setDesired] = useState<string | undefined>(undefined);

    useEffect(() => {
        try {
            tonConnectUI.setConnectionNetwork(desired);
        } catch (error) {
            console.warn('Cannot change network while wallet is connected:', error);
        }
    }, [desired, tonConnectUI, wallet]);

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
