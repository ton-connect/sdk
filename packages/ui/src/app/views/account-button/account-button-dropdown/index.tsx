import { Component, createSignal, JSXElement, Show, useContext } from 'solid-js';
import { Text } from 'src/app/components';
import { CopyIcon } from 'src/app/components/icons/copy-icon';
import { DisconnectIcon } from 'src/app/components/icons/disconnect-icon';
import { Styleable } from 'src/app/models/styleable';
import { TonConnectUiContext } from 'src/app/state/ton-connect-ui.context';
import { copyToClipboard } from 'src/app/utils/copy-to-clipboard';
import { AccountButtonDropdownStyled, MenuButtonStyled } from './style';

const MenuItemText: Component<{ children: JSXElement }> = props => (
    <Text fontSize="15px" letterSpacing="-0.24px" fontWeight="590">
        {props.children}
    </Text>
);

export interface AccountButtonDropdownProps extends Styleable {
    onDisconnectClick: () => void;
}

export const AccountButtonDropdown: Component<AccountButtonDropdownProps> = props => {
    const tonConnectUi = useContext(TonConnectUiContext)!;
    const [isCopiedShown, setIsCopiedShown] = createSignal(false);

    const onCopy = async (): Promise<void> => {
        await copyToClipboard(tonConnectUi.account!.address);
        setIsCopiedShown(true);

        setTimeout(() => setIsCopiedShown(false), 1000);
    };

    return (
        <AccountButtonDropdownStyled class={props.class}>
            <ul>
                <li>
                    <MenuButtonStyled onClick={() => onCopy()}>
                        <CopyIcon />
                        <Show when={!isCopiedShown()}>
                            <MenuItemText>Copy address</MenuItemText>
                        </Show>
                        <Show when={isCopiedShown()}>
                            <MenuItemText>Address copied!</MenuItemText>
                        </Show>
                    </MenuButtonStyled>
                </li>
                <li>
                    <MenuButtonStyled onClick={() => props.onDisconnectClick()}>
                        <DisconnectIcon />
                        <MenuItemText>Disconnect</MenuItemText>
                    </MenuButtonStyled>
                </li>
            </ul>
        </AccountButtonDropdownStyled>
    );
};
