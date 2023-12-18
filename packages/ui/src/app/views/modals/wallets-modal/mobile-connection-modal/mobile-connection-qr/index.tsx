import { Component } from 'solid-js';
import { H1Styled, H2Styled, QrCodeWrapper } from './style';
import { QRCode } from 'src/app/components';
import { WalletInfo } from '@tonconnect/sdk';

import { addReturnStrategy } from 'src/app/utils/url-strategy-helpers';

interface MobileConnectionQRProps {
    universalLink: string;
    walletInfo: Pick<WalletInfo, 'name' | 'imageUrl'>;
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
        </>
    );
};
