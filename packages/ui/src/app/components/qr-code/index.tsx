import { Component, createEffect, createSignal, Show } from 'solid-js';
import {
    CopiedBoxStyled,
    CopyIconButton,
    ImageBackground,
    ImageStyled,
    imgSizeDefault,
    picSizeDefault,
    QrCodeBackground,
    QrCodeWrapper,
    qrNormalSize
} from './style';
import qrcode from 'qrcode-generator';
import { Transition } from 'solid-transition-group';
import { copyToClipboard } from 'src/app/utils/copy-to-clipboard';
import { Styleable } from 'src/app/models/styleable';
import { toPx } from 'src/app/utils/css';
import { CopyLightIcon, SuccessIcon, Text } from 'src/app/components';
import { animate } from 'src/app/utils/animate';

export interface QRCodeProps extends Styleable {
    sourceUrl: string;
    imageUrl?: string;
    disableCopy?: boolean;
}

export const QRCode: Component<QRCodeProps> = props => {
    let qrCodeCanvasRef: HTMLDivElement | undefined;
    let qrCodeWrapperRef: HTMLDivElement | undefined;
    let imageRef: HTMLDivElement | undefined;

    const [copyButtonOpened, setCopyButtonOpened] = createSignal(false);

    const [picSize, setPicSize] = createSignal(picSizeDefault);

    createEffect(() => {
        const errorCorrectionLevel = 'L';
        const cellSize = 4;
        const qr = qrcode(0, errorCorrectionLevel);
        qr.addData(props.sourceUrl);
        qr.make();
        qrCodeCanvasRef!.innerHTML = qr.createSvgTag(cellSize, 0);
        const qrSize = qrCodeCanvasRef!.firstElementChild!.clientWidth;

        const scale = Math.round((qrNormalSize / qrSize) * 100000) / 100000;

        if (imageRef) {
            const imgSize = Math.ceil(imgSizeDefault / (scale * cellSize)) * cellSize;
            const imgOffset = toPx(Math.ceil((qrSize - imgSize) / (2 * cellSize)) * cellSize);
            imageRef.style.top = imgOffset;
            imageRef.style.left = imgOffset;
            imageRef.style.height = toPx(imgSize);
            imageRef.style.width = toPx(imgSize);

            setPicSize(Math.round(picSizeDefault / scale));
        }

        qrCodeWrapperRef!.style.transform = `scale(${scale})`;
    });

    let timeoutId: null | ReturnType<typeof setTimeout> = null;
    const onCopyClick = (): void => {
        setCopyButtonOpened(true);
        copyToClipboard(props.sourceUrl);

        if (timeoutId != null) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => setCopyButtonOpened(false), 1500);
    };

    return (
        <QrCodeBackground class={props.class} onClick={onCopyClick}>
            <QrCodeWrapper ref={qrCodeWrapperRef}>
                <div ref={qrCodeCanvasRef} />
                <Show when={props.imageUrl}>
                    <ImageBackground ref={imageRef}>
                        <ImageStyled src={props.imageUrl!} alt="" size={picSize()} />
                    </ImageBackground>
                </Show>
            </QrCodeWrapper>
            <Transition
                onBeforeEnter={el => {
                    animate(
                        el,
                        [
                            { opacity: 0, transform: 'translate(-50%, 44px)' },
                            { opacity: 1, transform: 'translate(-50%, 0)' }
                        ],
                        {
                            duration: 150,
                            easing: 'ease-out'
                        }
                    );
                }}
                onExit={(el, done) => {
                    animate(
                        el,
                        [
                            { opacity: 1, transform: 'translate(-50%, 0)' },
                            { opacity: 0, transform: 'translate(-50%, 44px)' }
                        ],
                        {
                            duration: 150,
                            easing: 'ease-out'
                        }
                    ).finished.then(() => {
                        done();
                    });
                }}
            >
                <Show when={copyButtonOpened() && !props.disableCopy}>
                    <CopiedBoxStyled>
                        <SuccessIcon size="xs" />
                        <Text translationKey="common.linkCopied">Link Copied</Text>
                    </CopiedBoxStyled>
                </Show>
            </Transition>
            <Show when={!props.disableCopy}>
                <CopyIconButton>
                    <CopyLightIcon />
                </CopyIconButton>
            </Show>
        </QrCodeBackground>
    );
};
