import { Component, createEffect, createSignal } from 'solid-js';
import { H1, H2, Text } from 'src/app/components';
import { Button } from 'src/app/components/button';
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
            <Modal opened={modalOpened()} onClose={() => setModalOpened(false)}>
                <H1>Connect a wallet</H1>
                <H2>Select your wallet from the options to get started.</H2>
                <Text>
                    Never gonna give you up Never gonna let you down Never gonna run around and
                    desert you Never gonna make you cry Never gonna say goodbye Never gonna tell a
                    lie and hurt you
                </Text>
                <Button appearance="primary" onClick={() => setModalOpened(false)}>
                    GET
                </Button>
                <Button appearance="secondary" onClick={() => setModalOpened(false)}>
                    Close
                </Button>
            </Modal>
        </ModalWrapper>
    );
};
