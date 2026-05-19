import { useEffect } from 'react';
import { useTonConnectUI, useTonWallet, CHAIN } from '@tonconnect/ui-react';
import { CHAIN_TETRA } from '@/core/utils/network';
import { useQueryState } from '@/core/hooks/use-query-state';

const CARET_BG =
    "url(\"data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%2366aaee' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")";

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
            className="min-w-[150px] cursor-pointer appearance-none rounded-[10px] border border-[rgba(102,170,238,0.3)] bg-[linear-gradient(135deg,rgba(28,95,164,0.15)_0%,rgba(102,170,238,0.1)_100%)] bg-[length:auto,_auto] bg-[position:right_12px_center] bg-no-repeat py-[10px] pl-4 pr-9 text-sm font-medium text-[#b8d4f1] shadow-[0_2px_8px_rgba(0,0,0,0.1)] outline-none hover:border-[rgba(102,170,238,0.5)] hover:bg-[linear-gradient(135deg,rgba(28,95,164,0.2)_0%,rgba(102,170,238,0.15)_100%)] hover:shadow-[0_4px_12px_rgba(102,170,238,0.2)] focus:border-[#66aaee] focus:shadow-[0_4px_16px_rgba(102,170,238,0.3)] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[rgba(102,170,238,0.3)] disabled:cursor-not-allowed disabled:border-[rgba(102,170,238,0.15)] disabled:bg-[linear-gradient(135deg,rgba(28,95,164,0.08)_0%,rgba(102,170,238,0.05)_100%)] disabled:text-[rgba(184,212,241,0.6)] disabled:opacity-70 disabled:shadow-none [&::-ms-expand]:hidden [&>option]:bg-[#1a1a1a] [&>option]:text-[#d9e7f7]"
            style={{ backgroundImage: CARET_BG }}
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
