import { useEffect } from 'react';
import { useTonConnectUI, useTonWallet, CHAIN } from '@tonconnect/ui-react';
import './style.scss';
import { CHAIN_TETRA } from '../../utils/network';
import { useQueryState } from '../../hooks/useQueryState';

export function NetworkPicker() {
    const [tonConnectUI] = useTonConnectUI();
    const wallet = useTonWallet();
    const [desired, setDesired] = useQueryState('chain');

    useEffect(() => {
        try {
            if (desired) {
                tonConnectUI.setConnectionNetwork(desired);
            }
        } catch (error) {
            console.warn('Cannot change network while wallet is connected:', error);
        }
    }, [desired, tonConnectUI]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setDesired(value);
    };

    return (
        <select
            className="network-picker"
            value={desired || ''}
            onChange={handleChange}
            disabled={!!wallet}
        >
            <option value="">Any Network</option>
            <option value={CHAIN.MAINNET}>Mainnet</option>
            <option value={CHAIN.TESTNET}>Testnet</option>
            <option value={CHAIN_TETRA}>Tetra</option>
        </select>
    );
}
