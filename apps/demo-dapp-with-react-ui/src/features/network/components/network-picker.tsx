import { useEffect } from 'react';
import { useTonConnectUI, useTonWallet, CHAIN } from '@tonconnect/ui-react';

import { Select } from '@/core/components/ui/select';
import { ChevronDownIcon } from '@/core/components/ui/icons';
import { CHAIN_TETRA } from '@/core/utils/network';
import { useQueryState } from '@/core/hooks/use-query-state';

const NETWORK_LABELS: Record<string, string> = {
    '': 'Any Network',
    [CHAIN.MAINNET]: 'Mainnet',
    [CHAIN.TESTNET]: 'Testnet',
    [CHAIN_TETRA]: 'Tetra'
};

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

    const value = desired || '';
    const label = NETWORK_LABELS[value] ?? value;

    return (
        <Select.Root value={value} onValueChange={setDesired} disabled={!!wallet}>
            <Select.Trigger variant="gray" size="s" borderRadius="l" disabled={!!wallet}>
                {label}
                <ChevronDownIcon size={16} />
            </Select.Trigger>
            <Select.Content>
                <Select.Item value="">Any Network</Select.Item>
                <Select.Item value={CHAIN.MAINNET}>Mainnet</Select.Item>
                <Select.Item value={CHAIN.TESTNET}>Testnet</Select.Item>
                <Select.Item value={CHAIN_TETRA}>Tetra</Select.Item>
            </Select.Content>
        </Select.Root>
    );
}
