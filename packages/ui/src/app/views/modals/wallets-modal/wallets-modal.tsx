import { WalletInfo, WalletInfoRemote } from '@tonconnect/sdk';
import { Component, createSignal, Show, useContext } from 'solid-js';
import { ConnectorContext } from 'src/app/state/connector.context';
import { setWalletsModalOpen, walletsModalOpen } from 'src/app/state/modals-state';
import { QrCodeModal } from 'src/app/views/modals/wallets-modal/qr-code-modal';
import { SelectWalletModal } from 'src/app/views/modals/wallets-modal/select-wallet-modal';
import { ModalWrapper, StyledModal } from './style';

export const WalletsModal: Component = () => {
    const connector = useContext(ConnectorContext)!;
    const [selectedWallet, setSelectedWallet] = createSignal<WalletInfo | null>(null);

    const onClose = (): void => {
        setWalletsModalOpen(false);
        setSelectedWallet(null);
    };

    connector.onStatusChange(wallet => {
        if (wallet) {
            onClose();
        }
    });

    return (
        <ModalWrapper>
            <StyledModal opened={walletsModalOpen()} onClose={onClose}>
                <Show when={!selectedWallet()} keyed={false}>
                    <SelectWalletModal onSelect={wallet => setSelectedWallet(wallet)} />
                </Show>
                <Show when={selectedWallet()} keyed={false}>
                    <QrCodeModal
                        wallet={selectedWallet() as WalletInfoRemote}
                        onBackClick={() => setSelectedWallet(null)}
                    />
                </Show>
            </StyledModal>
        </ModalWrapper>
    );
};
