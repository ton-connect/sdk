import { Component, createSignal, Show, useContext } from 'solid-js';
import { ArrowIcon, Text, TonIcon } from 'src/app/components';
import { ConnectorContext } from 'src/app/state/connector.context';
import { TonConnectUiContext } from 'src/app/state/ton-connect-ui.context';
import { AccountButtonStyled } from './style';

interface AccountButtonProps {}

export const AccountButton: Component<AccountButtonProps> = () => {
    const connector = useContext(ConnectorContext)!;
    const tonConnectUI = useContext(TonConnectUiContext)!;
    const [isOpened, setIsOpened] = createSignal(false);
    const [address, setAddress] = createSignal('');

    const normalizedAddress = (): string => {
        if (address()) {
            return address().slice(0, 5) + '...' + address().slice(-3);
        }

        return '';
    };

    connector.onStatusChange(wallet => {
        if (!wallet) {
            setIsOpened(false);
            setAddress('');
            return;
        }

        setAddress(wallet.account.address);
    });

    return (
        <>
            <Show when={!address()}>
                <AccountButtonStyled appearance="flat" onClick={() => tonConnectUI.connectWallet()}>
                    <TonIcon />
                    <Text fontSize="15px" letterSpacing="-0.24px" fontWeight="590">
                        Connect wallet
                    </Text>
                </AccountButtonStyled>
            </Show>
            <Show when={address()}>
                <AccountButtonStyled appearance="flat" onClick={() => setIsOpened(v => !v)}>
                    <span>{normalizedAddress()}</span>
                    <ArrowIcon direction={isOpened() ? 'top' : 'bottom'} />
                </AccountButtonStyled>
            </Show>
        </>
    );
};
