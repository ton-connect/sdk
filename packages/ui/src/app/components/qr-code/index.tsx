import { Component, createEffect, createSignal, Show } from 'solid-js';
import {
    CopyButtonStyled,
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
import { Translation } from 'src/app/components/typography/Translation';
import { Styleable } from 'src/app/models/styleable';
import { toPx } from 'src/app/utils/css';

export interface QRCodeProps extends Styleable {
    sourceUrl: string;
    imageUrl?: string;
    disableCopy?: boolean;
}

type CopyButtonText = {
    translationKey: string;
    text: string;
};

const copyText: CopyButtonText = {
    translationKey: 'common.copyLink',
    text: 'Copy Link'
};

const copiedText: CopyButtonText = {
    translationKey: 'common.copied',
    text: 'Copied!'
};

export const QRCode: Component<QRCodeProps> = props => {
    let qrCodeCanvasRef: HTMLDivElement | undefined;
    let qrCodeWrapperRef: HTMLDivElement | undefined;
    let imageRef: HTMLDivElement | undefined;

    const [copyButtonOpened, setCopyButtonOpened] = createSignal(false);
    const [copyButtonHovered, setCopyButtonHovered] = createSignal(false);
    const [qrHovered, setQrHovered] = createSignal(false);
    const [copyButtonText, setCopyButtonText] = createSignal<CopyButtonText>(copyText);

    const [picSize, setPicSize] = createSignal(picSizeDefault);

    createEffect(() => setCopyButtonOpened(copyButtonHovered() || qrHovered()));

    createEffect(() => !copyButtonOpened() && setCopyButtonText(copyText));

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
        copyToClipboard(props.sourceUrl);
        setCopyButtonText(copiedText);

        if (timeoutId != null) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => setCopyButtonText(copyText), 3000);
    };

    return (
        <QrCodeBackground class={props.class}>
            <QrCodeWrapper
                ref={qrCodeWrapperRef}
                onMouseEnter={() => setQrHovered(true)}
                onMouseLeave={() => setTimeout(() => setQrHovered(false))}
            >
                <div ref={qrCodeCanvasRef} />
                <Show when={props.imageUrl}>
                    <ImageBackground ref={imageRef}>
                        <ImageStyled src={props.imageUrl!} alt="" size={picSize()} />
                    </ImageBackground>
                </Show>
            </QrCodeWrapper>
            <Transition
                onBeforeEnter={el => {
                    el.animate(
                        [
                            { opacity: 0, transform: 'translate(-50%, 44px)' },
                            { opacity: 1, transform: 'translate(-50%, 0)' }
                        ],
                        {
                            duration: 200
                        }
                    );
                }}
                onExit={(el, done) => {
                    el.animate(
                        [
                            { opacity: 1, transform: 'translate(-50%, 0)' },
                            { opacity: 0, transform: 'translate(-50%, 44px)' }
                        ],
                        {
                            duration: 200
                        }
                    ).finished.then(() => {
                        done();
                    });
                }}
            >
                <Show when={copyButtonOpened() && !props.disableCopy}>
                    <CopyButtonStyled
                        onClick={onCopyClick}
                        onMouseEnter={() => copyButtonOpened() && setCopyButtonHovered(true)}
                        onMouseLeave={() => setTimeout(() => setCopyButtonHovered(false))}
                    >
                        <Translation translationKey={copyButtonText().translationKey}>
                            {copyButtonText().text}
                        </Translation>
                    </CopyButtonStyled>
                </Show>
            </Transition>
        </QrCodeBackground>
    );
};
