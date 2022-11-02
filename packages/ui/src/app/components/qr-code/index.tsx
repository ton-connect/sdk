import { Component, createEffect } from 'solid-js';
import { QrCodeStyled } from './style';
import QRCodeStyling from 'qr-code-styling';

interface QRCodeProps {
    imageUrl?: string;
    sourceUrl: string;
}

export const QRCode: Component<QRCodeProps> = props => {
    let qrCodeCanvas: HTMLDivElement | undefined;

    createEffect(() => {
        const qrCode = new QRCodeStyling({
            width: 280,
            height: 280,
            type: 'svg',
            data: props.sourceUrl,
            image: props.imageUrl,
            imageOptions: {
                hideBackgroundDots: true,
                imageSize: 0.25,
                margin: 3
            },
            dotsOptions: {
                type: 'dots',
                color: '#0F0F0F'
            },
            backgroundOptions: {
                color: 'transparent'
            },
            cornersSquareOptions: {
                type: 'dot',
                color: '#0F0F0F'
            },
            cornersDotOptions: {
                type: 'dot',
                color: '#0F0F0F'
            }
        });

        qrCode.append(qrCodeCanvas);
    });

    return (
        <QrCodeStyled>
            <div ref={qrCodeCanvas} />
        </QrCodeStyled>
    );
};
