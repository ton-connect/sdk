import { Component, createSignal, Show } from 'solid-js';
import { ArrowIcon, Text, TonIcon } from 'src/app/components';
import { TonConnectUi } from 'src/ton-connect-ui';
import { AccountButtonStyled } from './style';

interface AccountButtonProps {
    widgetController: TonConnectUi;
}

export const AccountButton: Component<AccountButtonProps> = props => {
    const [isOpened, setIsOpened] = createSignal(false);
    const [address, setAddress] = createSignal('');

    const normalizedAddress = (): string => {
        if (address()) {
            return address().slice(0, 5) + '...' + address().slice(-3);
        }

        return '';
    };

    props.widgetController.onStatusChange(wallet => {
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
                <AccountButtonStyled
                    appearance="flat"
                    onClick={() => props.widgetController.connectWallet()}
                >
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
