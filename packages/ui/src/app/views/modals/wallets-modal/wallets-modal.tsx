import { Component, createEffect, createSignal } from 'solid-js';
import { Button } from 'src/app/components/button';
import { IconButton } from 'src/app/components/icon-button';
import { Modal } from 'src/app/components/modal';
import { ModalWrapper } from './style';

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
            <IconButton onClick={() => console.log(333)} icon="close" />
            <IconButton onClick={() => console.log(333)} icon="arrow" />
            <Modal opened={modalOpened()} onClose={() => setModalOpened(false)}>
                hello world
            </Modal>
        </ModalWrapper>
    );
};
