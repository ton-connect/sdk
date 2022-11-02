import { Component, createEffect, createSignal } from 'solid-js';
import { Button } from 'src/app/components/button';
import { SelectWalletModal } from 'src/app/views/modals/wallets-modal/select-wallet-modal';
import { ModalWrapper, StyledModal } from './style';

export const WalletsModal: Component = () => {
    const [modalOpened, setModalOpened] = createSignal(false);

    createEffect(() => {
        console.log(modalOpened());
    });

    return (
        <ModalWrapper>
            <Button appearance="secondary" onClick={() => setModalOpened(true)}>
                Connect Wallet
            </Button>
            <StyledModal opened={modalOpened()} onClose={() => setModalOpened(false)}>
                <SelectWalletModal />
            </StyledModal>
        </ModalWrapper>
    );
};
