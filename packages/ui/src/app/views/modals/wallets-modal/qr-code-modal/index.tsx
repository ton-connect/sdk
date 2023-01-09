import { isWalletInfoInjected, WalletInfoInjected, WalletInfoRemote } from '@tonconnect/sdk';
import { Component, Show, useContext } from 'solid-js';
import { Button, H1, H2 } from 'src/app/components';
import { QRCode } from 'src/app/components/qr-code';
import { Translation } from 'src/app/components/typography/Translation';
import {
    ActionButtonStyled,
    ButtonsContainerStyled,
    GetWalletStyled,
    QRBackgroundStyled,
    QrCodeModalStyled,
    StyledIconButton,
    TextStyled
} from './style';
import { ConnectorContext } from 'src/app/state/connector.context';
import { openLink, openLinkBlank } from 'src/app/utils/web-api';
import { Identifiable } from 'src/app/models/identifiable';

export interface QrCodeModalProps extends Identifiable {
    wallet: WalletInfoRemote | (WalletInfoRemote & WalletInfoInjected);
    onBackClick: () => void;
}

export const QrCodeModal: Component<QrCodeModalProps> = props => {
    const connector = useContext(ConnectorContext)!;
    const universalLink = connector.connect({
        universalLink: props.wallet.universalLink,
        bridgeUrl: props.wallet.bridgeUrl
    });

    return (
        <QrCodeModalStyled id={props.id}>
            <StyledIconButton icon="arrow" onClick={() => props.onBackClick()} />
            <H1
                translationKey="walletModal.qrCodeModal.connectWith"
                translationValues={{ name: props.wallet.name }}
            >
                Connect with {props.wallet.name}
            </H1>
            <H2
                translationKey="walletModal.qrCodeModal.scan"
                translationValues={{ name: props.wallet.name }}
            >
                Scan QR code with your phone’s or {props.wallet.name}’s camera.
            </H2>
            <QRBackgroundStyled>
                <QRCode sourceUrl={universalLink} imageUrl={props.wallet.imageUrl} />
            </QRBackgroundStyled>
            <ButtonsContainerStyled>
                <ActionButtonStyled onClick={() => openLink(universalLink)}>
                    <Translation
                        translationKey="walletModal.qrCodeModal.openWallet"
                        translationValues={{ name: props.wallet.name }}
                    >
                        Open {props.wallet.name}
                    </Translation>
                </ActionButtonStyled>
                <Show when={isWalletInfoInjected(props.wallet) && props.wallet.injected}>
                    <ActionButtonStyled
                        onClick={() =>
                            connector.connect({
                                jsBridgeKey: (props.wallet as WalletInfoInjected).jsBridgeKey
                            })
                        }
                    >
                        <Translation translationKey="walletModal.qrCodeModal.openExtension">
                            Open Extension
                        </Translation>
                    </ActionButtonStyled>
                </Show>
            </ButtonsContainerStyled>
            <GetWalletStyled>
                <TextStyled
                    translationKey="walletModal.qrCodeModal.dontHave"
                    translationValues={{ name: props.wallet.name }}
                >
                    Don't have {props.wallet.name}?
                </TextStyled>
                <Button onClick={() => openLinkBlank(props.wallet.aboutUrl)}>
                    <Translation translationKey="walletModal.qrCodeModal.get">GET</Translation>
                </Button>
            </GetWalletStyled>
        </QrCodeModalStyled>
    );
};
