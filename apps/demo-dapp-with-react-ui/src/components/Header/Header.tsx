import { TonConnectButton, useTonConnectUI } from '@tonconnect/ui-react';
import { NetworkPicker } from '../NetworkPicker/NetworkPicker';
import './header.scss';
import { TonConnectUI } from '@tonconnect/ui-react';

function revalidateCache(tonConnect: TonConnectUI) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (tonConnect.connector as any).walletsList.walletsListDTOCache = null;
}

const ResetWalletList = () => {
    const [tonConnect] = useTonConnectUI();

    return <button onClick={() => revalidateCache(tonConnect)}>Reset wallet list</button>;
};

export const Header = () => {
    return (
        <header>
            <span>My App with React UI</span>
            <div className="header__controls">
                <NetworkPicker />
                <ResetWalletList />
                <TonConnectButton />
            </div>
        </header>
    );
};
