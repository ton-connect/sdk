import { Component, createSignal, JSXElement, Show, useContext } from 'solid-js';
import { Text } from 'src/app/components';
import { CopyIcon } from 'src/app/components/icons/copy-icon';
import { DisconnectIcon } from 'src/app/components/icons/disconnect-icon';
import { Styleable } from 'src/app/models/styleable';
import { ConnectorContext } from 'src/app/state/connector.context';
import { TonConnectUiContext } from 'src/app/state/ton-connect-ui.context';
import { copyToClipboard } from 'src/app/utils/copy-to-clipboard';
import { AccountButtonDropdownStyled, MenuButtonStyled, UlStyled } from './style';

const MenuItemText: Component<{ children: JSXElement }> = props => (
    <Text fontSize="15px" letterSpacing="-0.24px" fontWeight="590">
        {props.children}
    </Text>
);

export interface AccountButtonDropdownProps extends Styleable {
    onClose: () => void;
    ref: HTMLDivElement | undefined;
}

export const AccountButtonDropdown: Component<AccountButtonDropdownProps> = props => {
    const tonConnectUi = useContext(TonConnectUiContext)!;
    const connector = useContext(ConnectorContext)!;
    const [isCopiedShown, setIsCopiedShown] = createSignal(false);

    const onCopy = async (): Promise<void> => {
        await copyToClipboard(tonConnectUi.account!.address);
        setIsCopiedShown(true);

        setTimeout(() => setIsCopiedShown(false), 1000);
    };

    const onDisconnect = (): void => {
        connector.disconnect();
        props.onClose();
    };

    return (
        <AccountButtonDropdownStyled ref={props.ref} class={props.class}>
            <UlStyled>
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
                    <MenuButtonStyled onClick={() => onDisconnect()}>
                        <DisconnectIcon />
                        <MenuItemText>Disconnect</MenuItemText>
                    </MenuButtonStyled>
                </li>
            </UlStyled>
        </AccountButtonDropdownStyled>
    );
};
