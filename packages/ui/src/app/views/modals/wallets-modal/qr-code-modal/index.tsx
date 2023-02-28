import {
    ConnectAdditionalRequest,
    isWalletInfoCurrentlyInjected,
    WalletInfoCurrentlyInjected,
    WalletInfoInjectable,
    WalletInfoRemote
} from '@tonconnect/sdk';
import { Component, createMemo, Show, useContext } from 'solid-js';
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
import { addReturnStrategy, openLinkBlank } from 'src/app/utils/web-api';
import { Identifiable } from 'src/app/models/identifiable';
import { setLastSelectedWalletInfo } from 'src/app/state/modals-state';
import { appState } from 'src/app/state/app.state';
import { Link } from 'src/app/components/link';

export interface QrCodeModalProps extends Identifiable {
    additionalRequest?: ConnectAdditionalRequest;
    wallet: WalletInfoRemote | (WalletInfoRemote & WalletInfoInjectable);
    onBackClick: () => void;
}

export const QrCodeModal: Component<QrCodeModalProps> = props => {
    const connector = useContext(ConnectorContext)!;
    const universalLink = createMemo(() =>
        connector.connect(
            {
                universalLink: props.wallet.universalLink,
                bridgeUrl: props.wallet.bridgeUrl
            },
            props.additionalRequest
        )
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
                disableCopy={false}
                sourceUrl={universalLink()}
                imageUrl={props.wallet.imageUrl}
            />
            <ButtonsContainerStyled>
                <ActionButtonStyled
                    scale="s"
                    onClick={() => {
                        setLastSelectedWalletInfo({
                            ...props.wallet,
                            openMethod: 'universal-link'
                        });
                        openLinkBlank(addReturnStrategy(universalLink(), appState.returnStrategy));
                    }}
                >
                    <Translation
                        translationKey="walletModal.qrCodeModal.openWallet"
                        translationValues={{ name: props.wallet.name }}
                    >
                        Open {props.wallet.name}
                    </Translation>
                </ActionButtonStyled>
                <Show when={isWalletInfoCurrentlyInjected(props.wallet)}>
                    <ActionButtonStyled
                        scale="s"
                        onClick={() => {
                            setLastSelectedWalletInfo(props.wallet as WalletInfoCurrentlyInjected);
                            connector.connect(
                                {
                                    jsBridgeKey: (props.wallet as WalletInfoCurrentlyInjected)
                                        .jsBridgeKey
                                },
                                props.additionalRequest
                            );
                        }}
                    >
                        <Translation translationKey="common.openExtension">
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
                <Link href={props.wallet.aboutUrl} blank>
                    <Button>
                        <Translation translationKey="common.get">GET</Translation>
                    </Button>
                </Link>
            </GetWalletStyled>
        </QrCodeModalStyled>
    );
};
