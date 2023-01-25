import { Component } from 'solid-js';
import { UniversalQrModalStyled, H2Styled, QRCodeStyled, ButtonsContainerStyled } from './style';

interface UniversalQrModalProps {}

export const UniversalQrModal: Component<UniversalQrModalProps> = () => {
    return (
        <UniversalQrModalStyled>
            <H2Styled>Scan QR code with a TON Connect compatible wallet.</H2Styled>
            <QRCodeStyled sourceUrl="https://app.tonkeeper.com/ton-connect?v=2&id=3edf488fda8cdeceaddf7dba24fc075e455cd4a64139344efff4063b62660266&r=%7B%22manifestUrl%22%3A%22https%3A%2F%2Fton-connect.github.io%2Fdemo-dapp%2Ftonconnect-manifest.json%22%2C%22items%22%3A%5B%7B%22name%22%3A%22ton_addr%22%7D%5D%7D&ret=none" />
            <ButtonsContainerStyled />
        </UniversalQrModalStyled>
    );
};
