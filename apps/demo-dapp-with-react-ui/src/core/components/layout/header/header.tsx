import { TonConnectButton } from '@tonconnect/ui-react';
import { Link } from 'react-router-dom';

import { ThemeSwitcher } from '@/core/components/layout/theme-switcher';
import { NetworkPicker } from '@/features/network';

export const Header = () => {
    return (
        <header className="flex items-center justify-between gap-[10px] px-[25px] py-[10px] max-[525px]:flex-col [&>*:nth-child(2)]:max-[525px]:self-end">
            <span className="text-[30px] font-bold leading-[34px] text-primary">
                My App with React UI
            </span>
            <div className="flex items-center gap-3">
                <Link
                    to="/pay"
                    className="rounded-[12px] bg-[linear-gradient(135deg,#0098EA,#0078be)] px-[14px] py-2 text-[13px] font-semibold text-white no-underline"
                >
                    One-click pay demo →
                </Link>
                <NetworkPicker />
                <ThemeSwitcher />
                <TonConnectButton />
            </div>
        </header>
    );
};
