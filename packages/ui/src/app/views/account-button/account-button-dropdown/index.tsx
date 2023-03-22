import { Component, createSignal, Show, useContext } from 'solid-js';
import { Text } from 'src/app/components';
import { CopyIcon } from 'src/app/components/icons/copy-icon';
import { DisconnectIcon } from 'src/app/components/icons/disconnect-icon';
import { Styleable } from 'src/app/models/styleable';
import { Translateable } from 'src/app/models/translateable';
import { TonConnectUiContext } from 'src/app/state/ton-connect-ui.context';
import { CHAIN, toUserFriendlyAddress } from '@tonconnect/sdk';
import { copyToClipboard } from 'src/app/utils/copy-to-clipboard';
import { AccountButtonDropdownStyled, MenuButtonStyled, UlStyled } from './style';

const MenuItemText: Component<{ children: string } & Translateable> = props => (
    <Text translationKey={props.translationKey} fontSize="15px" fontWeight="590">
        {props.children}
    </Text>
);

export interface AccountButtonDropdownProps extends Styleable {
    onClose: () => void;
    ref: HTMLDivElement | undefined;
}

export const AccountButtonDropdown: Component<AccountButtonDropdownProps> = props => {
    const tonConnectUi = useContext(TonConnectUiContext)!;
    const [isCopiedShown, setIsCopiedShown] = createSignal(false);

    const onCopy = async (): Promise<void> => {
        const userFriendlyAddress = toUserFriendlyAddress(
            tonConnectUi.account!.address,
            tonConnectUi.account!.chain === CHAIN.TESTNET
        );
        await copyToClipboard(userFriendlyAddress);
        setIsCopiedShown(true);

        setTimeout(() => setIsCopiedShown(false), 1000);
    };

    const onDisconnect = (): void => {
        tonConnectUi.disconnect();
        props.onClose();
    };

    return (
        <AccountButtonDropdownStyled ref={props.ref} class={props.class} data-tc-dropdown="true">
            <UlStyled>
                <li>
                    <MenuButtonStyled onClick={() => onCopy()}>
                        <CopyIcon />
                        <Show when={!isCopiedShown()}>
                            <MenuItemText translationKey="button.dropdown.copy">
                                Copy address
                            </MenuItemText>
                        </Show>
                        <Show when={isCopiedShown()}>
                            <MenuItemText translationKey="button.dropdown.copied">
                                Address copied!
                            </MenuItemText>
                        </Show>
                    </MenuButtonStyled>
                </li>
                <li>
                    <MenuButtonStyled onClick={() => onDisconnect()}>
                        <DisconnectIcon />
                        <MenuItemText translationKey="button.dropdown.disconnect">
                            Disconnect
                        </MenuItemText>
                    </MenuButtonStyled>
                </li>
            </UlStyled>
        </AccountButtonDropdownStyled>
    );
};
