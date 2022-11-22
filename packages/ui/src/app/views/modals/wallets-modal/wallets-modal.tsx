import { Component, createSignal, Show } from 'solid-js';
import { UiWallet } from 'src/app/models/ui-wallet';
import { setWalletsModalOpen, walletsModalOpen } from 'src/app/state/modals-state';
import { QrCodeModal } from 'src/app/views/modals/wallets-modal/qr-code-modal';
import { SelectWalletModal } from 'src/app/views/modals/wallets-modal/select-wallet-modal';
import { ModalWrapper, StyledModal } from './style';

export const WalletsModal: Component = () => {
    const [selectedWallet, setSelectedWallet] = createSignal<UiWallet | null>(null);

    const onClose = (): void => {
        setSelectedWallet(null);
        setWalletsModalOpen(false);
    };

    return (
        <ModalWrapper>
            <StyledModal opened={walletsModalOpen()} onClose={onClose}>
                <Show when={!selectedWallet()} keyed={false}>
                    <SelectWalletModal onSelect={wallet => setSelectedWallet(wallet)} />
                </Show>
                <Show when={selectedWallet()} keyed={false}>
                    <QrCodeModal
                        wallet={selectedWallet()!}
                        onBackClick={() => setSelectedWallet(null)}
                    />
                </Show>
            </StyledModal>
        </ModalWrapper>
    );
};
