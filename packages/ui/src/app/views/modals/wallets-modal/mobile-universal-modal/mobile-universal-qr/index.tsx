import { Component } from 'solid-js';
import { H1Styled, H2Styled, QrCodeWrapper, ButtonsWrapper, ActionButton } from './style';
import { QRCode } from 'src/app/components';
import { IMG } from 'src/app/env/IMG';

import { addReturnStrategy } from 'src/app/utils/url-strategy-helpers';
import { Translation } from 'src/app/components/typography/Translation';

interface MobileUniversalQRProps {
    universalLink: string;
    onOpenLink: () => void;
    onCopy: () => void;
    isCopiedShown: ReturnType<typeof setTimeout> | void;
}

export const MobileUniversalQR: Component<MobileUniversalQRProps> = props => {
    return (
        <>
            <H1Styled translationKey="walletModal.mobileUniversalModal.connectYourWallet">
                Connect your TON wallet
            </H1Styled>
            <H2Styled translationKey="walletModal.mobileUniversalModal.scan">
                Scan with your mobile wallet
            </H2Styled>
            <QrCodeWrapper>
                <QRCode
                    imageUrl={IMG.TON}
                    sourceUrl={addReturnStrategy(props.universalLink, 'none')}
                    disableCopy
                />
            </QrCodeWrapper>
            <ButtonsWrapper>
                <ActionButton appearance="secondary" onClick={() => props.onOpenLink()}>
                    <Translation translationKey="walletModal.mobileUniversalModal.openLink">
                        Open Link
                    </Translation>
                </ActionButton>
                <ActionButton appearance="secondary" onClick={() => props.onCopy()}>
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
