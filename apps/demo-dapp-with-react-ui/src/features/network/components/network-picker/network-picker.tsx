import { useEffect } from 'react';
import { useTonConnectUI, useTonWallet, CHAIN } from '@tonconnect/ui-react';

import { Select } from '../../../../core/components/ui/select/index';
import { ChevronDownIcon } from '../../../../core/components/ui/icons/index';
import { CHAIN_TETRA } from '../../../../core/utils/network';
import { useQueryState } from '../../../../core/hooks/use-query-state';
import { getNetworkName } from '../../../../core/hooks/use-wallet-network';

interface NetworkPickerProps {
    triggerClassName?: string;
}

export function NetworkPicker({ triggerClassName }: NetworkPickerProps = {}) {
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
    const label = value === '' ? 'Any Network' : (getNetworkName(value) ?? value);

    return (
        <Select.Root value={value} onValueChange={setDesired} disabled={!!wallet}>
            <Select.Trigger
                variant="gray"
                size="s"
                borderRadius="l"
                fullWidth
                disabled={!!wallet}
                className={triggerClassName}
            >
                <span className="truncate text-left">{label}</span>
                <ChevronDownIcon size={16} className="shrink-0" />
            </Select.Trigger>
            <Select.Content>
                <Select.Item value="">Any Network</Select.Item>
                <Select.Item value={CHAIN.MAINNET}>{getNetworkName(CHAIN.MAINNET)}</Select.Item>
                <Select.Item value={CHAIN.TESTNET}>{getNetworkName(CHAIN.TESTNET)}</Select.Item>
                <Select.Item value={CHAIN_TETRA}>{getNetworkName(CHAIN_TETRA)}</Select.Item>
            </Select.Content>
        </Select.Root>
    );
}
