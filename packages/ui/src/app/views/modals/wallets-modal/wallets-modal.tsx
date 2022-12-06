import { WalletInfo, WalletInfoRemote } from '@tonconnect/sdk';
import { Component, createSignal, onCleanup, Show, useContext } from 'solid-js';
import { ConnectorContext } from 'src/app/state/connector.context';
import {
    setLastSelectedWalletInfo,
    setWalletsModalOpen,
    walletsModalOpen
} from 'src/app/state/modals-state';
import { QrCodeModal } from 'src/app/views/modals/wallets-modal/qr-code-modal';
import { SelectWalletModal } from 'src/app/views/modals/wallets-modal/select-wallet-modal';
import { ModalWrapper, StyledModal } from './style';

export const WalletsModal: Component = () => {
    const connector = useContext(ConnectorContext)!;

    const [selectedWalletInfo, setSelectedWalletInfo] = createSignal<WalletInfo | null>(null);

    const onClose = (): void => {
        setWalletsModalOpen(false);
        setSelectedWalletInfo(null);
    };

    const onSelect = (walletInfo: WalletInfo): void => {
        setSelectedWalletInfo(walletInfo);
        setLastSelectedWalletInfo(walletInfo);
    };

    const unsubscribe = connector.onStatusChange(wallet => {
        if (wallet) {
            onClose();
        }
    });

    onCleanup(unsubscribe);

    return (
        <ModalWrapper>
            <StyledModal opened={walletsModalOpen()} onClose={onClose}>
                <Show when={!selectedWalletInfo()} keyed={false}>
                    <SelectWalletModal onSelect={onSelect} />
                </Show>
                <Show when={selectedWalletInfo()} keyed={false}>
                    <QrCodeModal
                        wallet={selectedWalletInfo() as WalletInfoRemote}
                        onBackClick={() => setSelectedWalletInfo(null)}
                    />
                </Show>
            </StyledModal>
        </ModalWrapper>
    );
};
