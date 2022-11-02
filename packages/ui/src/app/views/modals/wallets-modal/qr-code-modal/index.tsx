import { Component } from 'solid-js';
import { Button, H1, H2 } from 'src/app/components';
import { QRCode } from 'src/app/components/qr-code';
import { UiWallet } from 'src/app/models/ui-wallet';
import {
    GetWalletStyled,
    QRBackgroundStyled,
    QrCodeModalStyled,
    StyledIconButton,
    TextStyled
} from './style';

export interface QrCodeModalProps {
    wallet: UiWallet;
    onBackClick: () => void;
}

export const QrCodeModal: Component<QrCodeModalProps> = props => {
    const universalLink =
        'https://app.tonkeeper.com/ton-connect?v=2&id=9ceaf3c0cbeb7850dc67b058e47d2d1bd280ebce709dfff6ca4b5deb5bac465d&r=eyJ1cmwiOiJodHRwczovL3Rvbi1jb25uZWN0LmdpdGh1Yi5pby9kZW1vLWRhcHAvIiwiaWNvbiI6Imh0dHBzOi8vdG9uLWNvbm5lY3QuZ2l0aHViLmlvL2RlbW8tZGFwcC9mYXZpY29uLmljbyIsIm5hbWUiOiJEZW1vIERhcHAiLCJpdGVtcyI6W3sibmFtZSI6InRvbl9hZGRyIn1dfQ%253D%253D';

    return (
        <QrCodeModalStyled>
            <StyledIconButton icon="arrow" onClick={() => props.onBackClick()} />
            <H1>Connect with {props.wallet.name}</H1>
            <H2>Scan QR code with your phone’s or {props.wallet.name}’s camera.</H2>
            <QRBackgroundStyled>
                <QRCode sourceUrl={universalLink} imageUrl={props.wallet.iconUrl} />
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
