import { Component } from 'solid-js';
import { Button } from 'src/app/components/button';
import { ModalWrapper } from 'src/app/views/modals/wallets-modal/style';

export const WalletsModal: Component = () => {
    return (
        <ModalWrapper>
            <Button onClick={() => console.log(123)}>Connect Wallet</Button>
        </ModalWrapper>
    );
};
