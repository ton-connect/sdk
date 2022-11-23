import { WalletInfoRemote } from '@tonconnect/sdk';
import { Component, useContext } from 'solid-js';
import { Button, H1, H2 } from 'src/app/components';
import { QRCode } from 'src/app/components/qr-code';
import { ConnectorContext } from 'src/app/state/connector.context';
import {
    GetWalletStyled,
    QRBackgroundStyled,
    QrCodeModalStyled,
    StyledIconButton,
    TextStyled
} from './style';

export interface QrCodeModalProps {
    wallet: WalletInfoRemote;
    onBackClick: () => void;
}

export const QrCodeModal: Component<QrCodeModalProps> = props => {
    const connector = useContext(ConnectorContext)!;
    const universalLink = connector.connect({
        universalLink: props.wallet.universalLink,
        bridgeUrl: props.wallet.bridgeUrl
    });

    return (
        <QrCodeModalStyled>
            <StyledIconButton icon="arrow" onClick={() => props.onBackClick()} />
            <H1>Connect with {props.wallet.name}</H1>
            <H2>Scan QR code with your phone’s or {props.wallet.name}’s camera.</H2>
            <QRBackgroundStyled>
                <QRCode sourceUrl={universalLink} imageUrl={props.wallet.imageUrl} />
            </QRBackgroundStyled>
            <GetWalletStyled>
                <TextStyled>Don't have {props.wallet.name}?</TextStyled>
                <Button appearance="secondary" onClick={() => {}}>
                    GET
                </Button>
            </GetWalletStyled>
        </QrCodeModalStyled>
    );
};
