import { Component } from 'solid-js';
import { H1Styled, H2Styled, QrCodeWrapper, ButtonsWrapper, ActionButton } from './style';
import { QRCode } from 'src/app/components';
import { addReturnStrategy } from 'src/app/utils/url-strategy-helpers';
import { Translation } from 'src/app/components/typography/Translation';
import { UIWalletInfo } from 'src/app/models/ui-wallet-info';
import { stripWalletNameNote } from 'src/app/utils/wallets';

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
            <H1Styled>{stripWalletNameNote(props.walletInfo.name)}</H1Styled>
            <QrCodeWrapper>
                <QRCode
                    imageUrl={props.walletInfo.imageUrl}
                    sourceUrl={addReturnStrategy(props.universalLink, 'none')}
                    disableCopy
                />
            </QrCodeWrapper>
            <H2Styled
                translationKey="walletModal.mobileConnectionModal.scanQR"
                translationValues={{ name: stripWalletNameNote(props.walletInfo.name) }}
            >
                Scan the QR code with your phone’s or {stripWalletNameNote(props.walletInfo.name)}’s
                camera
            </H2Styled>
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
