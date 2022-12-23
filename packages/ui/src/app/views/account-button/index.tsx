import { Component, createSignal, onCleanup, onMount, Show, useContext } from 'solid-js';
import { ArrowIcon, Text, TonIcon } from 'src/app/components';
import { ConnectorContext } from 'src/app/state/connector.context';
import { TonConnectUiContext } from 'src/app/state/ton-connect-ui.context';
import { toUserFriendlyAddress } from 'src/app/utils/address';
import {
    AccountButtonStyled,
    DropdownContainerStyled,
    DropdownStyled,
    NotificationsStyled
} from './style';
import { Portal } from 'solid-js/web';
import { useFloating } from 'solid-floating-ui';
import { autoUpdate } from '@floating-ui/dom';
import { Transition } from 'solid-transition-group';

interface AccountButtonProps {}

export const AccountButton: Component<AccountButtonProps> = () => {
    const connector = useContext(ConnectorContext)!;
    const tonConnectUI = useContext(TonConnectUiContext)!;
    const [isOpened, setIsOpened] = createSignal(false);
    const [address, setAddress] = createSignal('');

    let dropDownRef: HTMLDivElement | undefined;

    const [floating, setFloating] = createSignal<HTMLDivElement | undefined>();
    const [anchor, setAnchor] = createSignal<HTMLButtonElement | undefined>();

    const position = useFloating(anchor, floating, {
        whileElementsMounted: autoUpdate,
        placement: 'bottom-end'
    });

    const normalizedAddress = (): string => {
        if (address()) {
            const userFriendlyAddress = toUserFriendlyAddress(address());
            return userFriendlyAddress.slice(0, 4) + '...' + userFriendlyAddress.slice(-4);
        }

        return '';
    };

    const unsubscribe = connector.onStatusChange(wallet => {
        if (!wallet) {
            setIsOpened(false);
            setAddress('');
            return;
        }

        setAddress(wallet.account.address);
    });

    const onClick = (e: Event): void | boolean => {
        if (!address() || !isOpened()) {
            return;
        }
        const clickToButton = anchor()!.contains(e.target as Node);
        const clickToDropdown = dropDownRef!.contains(e.target as Node);

        if (!clickToButton && !clickToDropdown) {
            setIsOpened(false);
        }
    };

    onMount(() => {
        document.body.addEventListener('click', onClick);
    });

    onCleanup(() => {
        document.body.removeEventListener('click', onClick);
        unsubscribe();
    });

    return (
        <>
            <Show when={!address()}>
                <AccountButtonStyled appearance="flat" onClick={() => tonConnectUI.connectWallet()}>
                    <TonIcon />
                    <Text
                        translationKey="button.connectWallet"
                        fontSize="15px"
                        letterSpacing="-0.24px"
                        fontWeight="590"
                    >
                        Connect wallet
                    </Text>
                </AccountButtonStyled>
            </Show>
            <Show when={address()}>
                <DropdownContainerStyled>
                    <AccountButtonStyled
                        appearance="flat"
                        onClick={() => setIsOpened(v => !v)}
                        ref={setAnchor}
                    >
                        <Text fontSize="15px" letterSpacing="-0.24px" fontWeight="590">
                            {normalizedAddress()}
                        </Text>
                        <ArrowIcon direction="bottom" />
                    </AccountButtonStyled>
                    <Portal>
                        <div
                            ref={setFloating}
                            style={{
                                position: position.strategy,
                                top: `${position.y ?? 0}px`,
                                left: `${position.x ?? 0}px`,
                                'z-index': 999
                            }}
                        >
                            <Transition
                                onBeforeEnter={el => {
                                    el.animate(
                                        [
                                            { opacity: 0, transform: 'translateY(-8px)' },
                                            { opacity: 1, transform: 'translateY(0)' }
                                        ],
                                        {
                                            duration: 150
                                        }
                                    );
                                }}
                                onExit={(el, done) => {
                                    const a = el.animate(
                                        [
                                            { opacity: 1, transform: 'translateY(0)' },
                                            { opacity: 0, transform: 'translateY(-8px)' }
                                        ],
                                        {
                                            duration: 150
                                        }
                                    );
                                    a.finished.then(done);
                                }}
                            >
                                <Show when={isOpened()}>
                                    <DropdownStyled
                                        hidden={!isOpened()}
                                        onClose={() => setIsOpened(false)}
                                        ref={dropDownRef}
                                    />
                                </Show>
                            </Transition>
                            <NotificationsStyled />
                        </div>
                    </Portal>
                </DropdownContainerStyled>
            </Show>
        </>
    );
};
