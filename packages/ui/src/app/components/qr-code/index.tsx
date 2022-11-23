import { Component, createEffect } from 'solid-js';
import { ImageBackground, QrCodeStyled } from './style';
import qrcode from 'qrcode-generator';

interface QRCodeProps {
    imageUrl?: string;
    sourceUrl: string;
}

export const QRCode: Component<QRCodeProps> = props => {
    let qrCodeCanvas: HTMLDivElement | undefined;

    createEffect(() => {
        const errorCorrectionLevel = 'L';
        const qr = qrcode(0, errorCorrectionLevel);
        qr.addData(props.sourceUrl);
        qr.make();
        qrCodeCanvas!.innerHTML = qr.createSvgTag(4);
    });

    return (
        <QrCodeStyled>
            <div ref={qrCodeCanvas} />
            <ImageBackground>
                <img src={props.imageUrl} alt="" />
            </ImageBackground>
        </QrCodeStyled>
    );
};
