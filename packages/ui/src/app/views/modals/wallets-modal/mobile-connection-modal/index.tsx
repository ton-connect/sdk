import { ConnectAdditionalRequest, WalletInfoRemote } from '@tonconnect/sdk';
import { Component, createMemo, createSignal, onCleanup, Show, useContext } from 'solid-js';
import {
    BodyStyled,
    BodyTextStyled,
    ErrorIconStyled,
    FooterButton,
    FooterStyled,
    H1Styled,
    ImageStyled,
    LoaderStyled,
    MobileConnectionModalStyled,
    StyledIconButton
} from './style';
import { ConnectorContext } from 'src/app/state/connector.context';
import { Button, H3, RetryIcon } from 'src/app/components';
import { appState } from 'src/app/state/app.state';
import { addReturnStrategy, openLinkBlank } from 'src/app/utils/web-api';
import { setLastSelectedWalletInfo } from 'src/app/state/modals-state';
import {formatName} from "src/app/utils/wallets";

export interface MobileConnectionProps {
    additionalRequest?: ConnectAdditionalRequest;
    wallet: WalletInfoRemote;
    onBackClick: () => void;
}

export const MobileConnectionModal: Component<MobileConnectionProps> = props => {
    const [connectionErrored, setConnectionErrored] = createSignal(false);
    const connector = useContext(ConnectorContext)!;

    const unsubscribe = connector.onStatusChange(
        () => {},
        () => {
            setConnectionErrored(true);
        }
    );

    const universalLink = createMemo(() =>
        connector.connect(
            {
                universalLink: props.wallet.universalLink,
                bridgeUrl: props.wallet.bridgeUrl
            },
            props.additionalRequest
        )
    );

    const onRetry = (): void => {
        setConnectionErrored(false);
        setLastSelectedWalletInfo({
            ...props.wallet,
            openMethod: 'universal-link'
        });
        openLinkBlank(addReturnStrategy(universalLink()!, appState.returnStrategy));
    };

    onCleanup(unsubscribe);
    onRetry();

    return (
        <MobileConnectionModalStyled data-tc-wallet-qr-modal-desktop="true">
            <StyledIconButton icon="arrow" onClick={() => props.onBackClick()} />
            <H1Styled>{formatName(props.wallet.name)}</H1Styled>

            <BodyStyled>
                <Show when={connectionErrored()}>
                    <ErrorIconStyled size="s" />
                    <BodyTextStyled>Connection declined</BodyTextStyled>
                    <Button leftIcon={<RetryIcon />} onClick={onRetry}>
                        Retry
                    </Button>
                </Show>
                <Show when={!connectionErrored()}>
                    <LoaderStyled size="m" />
                    <BodyTextStyled>Continue in {formatName(props.wallet.name)}…</BodyTextStyled>
                    <Button leftIcon={<RetryIcon />} onClick={onRetry}>
                        Retry
                    </Button>
                </Show>
            </BodyStyled>

            <FooterStyled>
                <ImageStyled src={props.wallet.imageUrl} />
                <H3>{formatName(props.wallet.name)}</H3>
                <FooterButton href={props.wallet.aboutUrl} blank>
                    <Button>GET</Button>
                </FooterButton>
            </FooterStyled>
        </MobileConnectionModalStyled>
    );
};
