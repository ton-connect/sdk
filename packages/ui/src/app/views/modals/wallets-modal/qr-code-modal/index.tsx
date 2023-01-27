import {
    ConnectAdditionalRequest,
    isWalletInfoInjected,
    WalletInfoInjected,
    WalletInfoRemote
} from '@tonconnect/sdk';
import { Component, Show, useContext } from 'solid-js';
import { Button, H1, H2 } from 'src/app/components';
import { Translation } from 'src/app/components/typography/Translation';
import {
    ActionButtonStyled,
    ButtonsContainerStyled,
    GetWalletStyled,
    QrCodeModalStyled,
    QRStyled,
    StyledIconButton,
    TextStyled
} from './style';
import { ConnectorContext } from 'src/app/state/connector.context';
import { addReturnStrategy, openLink, openLinkBlank } from 'src/app/utils/web-api';
import { Identifiable } from 'src/app/models/identifiable';
import { setLastSelectedWalletInfo } from 'src/app/state/modals-state';
import { appState } from 'src/app/state/app.state';

export interface QrCodeModalProps extends Identifiable {
    additionalRequest?: ConnectAdditionalRequest;
    wallet: WalletInfoRemote | (WalletInfoRemote & WalletInfoInjected);
    onBackClick: () => void;
}

export const QrCodeModal: Component<QrCodeModalProps> = props => {
    const connector = useContext(ConnectorContext)!;
    const universalLink = connector.connect(
        {
            universalLink: props.wallet.universalLink,
            bridgeUrl: props.wallet.bridgeUrl
        },
        props.additionalRequest
    );

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
            <QRStyled
                disableCopy={true}
                sourceUrl={universalLink}
                imageUrl={props.wallet.imageUrl}
            />
            <ButtonsContainerStyled>
                <ActionButtonStyled
                    onClick={() => {
                        setLastSelectedWalletInfo({
                            ...props.wallet,
                            openMethod: 'universal-link'
                        });
                        openLink(addReturnStrategy(universalLink, appState.returnStrategy));
                    }}
                >
                    <Translation
                        translationKey="walletModal.qrCodeModal.openWallet"
                        translationValues={{ name: props.wallet.name }}
                    >
                        Open {props.wallet.name}
                    </Translation>
                </ActionButtonStyled>
                <Show when={isWalletInfoInjected(props.wallet) && props.wallet.injected}>
                    <ActionButtonStyled
                        onClick={() => {
                            setLastSelectedWalletInfo(props.wallet as WalletInfoInjected);
                            connector.connect(
                                {
                                    jsBridgeKey: (props.wallet as WalletInfoInjected).jsBridgeKey
                                },
                                props.additionalRequest
                            );
                        }}
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
