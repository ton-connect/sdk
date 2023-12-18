import { Component } from 'solid-js';
import { H1Styled, H2Styled, QrCodeWrapper } from './style';
import { QRCode } from 'src/app/components';
import { IMG } from 'src/app/env/IMG';

import { addReturnStrategy } from 'src/app/utils/url-strategy-helpers';

interface MobileUniversalQRProps {
    universalLink: string;
}

export const MobileUniversalQR: Component<MobileUniversalQRProps> = props => {
    return (
        <>
            <H1Styled translationKey="walletModal.mobileUniversalModal.connectYourWallet">
                Connect your wallet
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
        </>
    );
};
