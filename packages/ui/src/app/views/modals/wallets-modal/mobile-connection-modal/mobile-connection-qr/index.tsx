import { Component } from 'solid-js';
import { H1Styled, H2Styled, QrCodeWrapper, ButtonsWrapper, ActionButton } from './style';
import { QRCode } from 'src/app/components';
import { addReturnStrategy } from 'src/app/utils/url-strategy-helpers';
import { Translation } from 'src/app/components/typography/Translation';
import { UIWalletInfo } from 'src/app/models/ui-wallet-info';

interface MobileConnectionQRProps {
    universalLink: string;
    walletInfo: Pick<UIWalletInfo, 'name' | 'imageUrl'>;
    onOpenLink?: () => void;
    onCopy?: () => void;
    isCopiedShown?: ReturnType<typeof setTimeout> | void;
}

export const MobileConnectionQR: Component<MobileConnectionQRProps> = props => {
    return (
        <>
            <H1Styled>{props.walletInfo.name}</H1Styled>
            <H2Styled
                translationKey="walletModal.mobileConnectionModal.scanQR"
                translationValues={{ name: props.walletInfo.name }}
            >
                Scan the QR code below with your phone’s or {props.walletInfo.name}’s camera
            </H2Styled>
            <QrCodeWrapper>
                <QRCode
                    imageUrl={props.walletInfo.imageUrl}
                    sourceUrl={addReturnStrategy(props.universalLink, 'none')}
                    disableCopy
                />
            </QrCodeWrapper>
            <ButtonsWrapper>
                <ActionButton appearance="secondary" onClick={() => props.onOpenLink?.()}>
                    <Translation translationKey="walletModal.mobileUniversalModal.openLink">
                        Open Link
                    </Translation>
                </ActionButton>
                <ActionButton appearance="secondary" onClick={() => props.onCopy?.()}>
                    <Translation
                        translationKey={
                            props.isCopiedShown !== undefined ? 'common.copied' : 'common.copyLink'
                        }
                    >
                        {props.isCopiedShown !== undefined ? 'Copied' : 'Copy Link'}
                    </Translation>
                </ActionButton>
            </ButtonsWrapper>
        </>
    );
};
