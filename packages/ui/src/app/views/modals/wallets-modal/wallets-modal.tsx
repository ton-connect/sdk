import { Component, createEffect, createSignal, Show } from 'solid-js';
import { Button } from 'src/app/components/button';
import { UiWallet } from 'src/app/models/ui-wallet';
import { QrCodeModal } from 'src/app/views/modals/wallets-modal/qr-code-modal';
import { SelectWalletModal } from 'src/app/views/modals/wallets-modal/select-wallet-modal';
import { ModalWrapper, StyledModal } from './style';

export const WalletsModal: Component = () => {
    const [modalOpened, setModalOpened] = createSignal(false);
    const [selectedWallet, setSelectedWallet] = createSignal<UiWallet | null>(null);

    createEffect(() => {
        console.log(modalOpened());
    });

    return (
        <ModalWrapper>
            <Button appearance="secondary" onClick={() => setModalOpened(true)}>
                Connect Wallet
            </Button>
            <StyledModal opened={modalOpened()} onClose={() => setModalOpened(false)}>
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
