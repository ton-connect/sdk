import { children, Component, createEffect, createSignal, JSXElement, Show } from 'solid-js';
import {
    CopiedBoxStyled,
    CopyIconButton,
    ImageBackground,
    ImageStyled,
    imgSizeDefault,
    LogoStyled,
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
import { QrHole, renderSquircleQr } from './squircle-qr';

export interface QRCodeProps extends Styleable {
    sourceUrl: string;
    imageUrl?: string;
    /** Laid over the middle in place of `imageUrl`. Its clicks are its own and do not copy the link. */
    logo?: JSXElement;
    disableCopy?: boolean;
}

export const QRCode: Component<QRCodeProps> = props => {
    let qrCodeCanvasRef: HTMLDivElement | undefined;
    let qrCodeWrapperRef: HTMLDivElement | undefined;
    let imageRef: HTMLDivElement | undefined;

    const [copyButtonOpened, setCopyButtonOpened] = createSignal(false);
    // Resolved once: reading an element prop again would create the element again
    const logo = children(() => props.logo);

    const [picSize, setPicSize] = createSignal(picSizeDefault);

    createEffect(() => {
        const errorCorrectionLevel = 'L';
        const cellSize = 4;
        const qr = qrcode(0, errorCorrectionLevel);
        qr.addData(props.sourceUrl);
        qr.make();
        const qrSize = qr.getModuleCount() * cellSize;

        const scale = Math.round((qrNormalSize / qrSize) * 100000) / 100000;
        let hole: QrHole | undefined;

        if (imageRef) {
            const imgSize = Math.ceil(imgSizeDefault / (scale * cellSize)) * cellSize;
            const imgOffset = Math.ceil((qrSize - imgSize) / (2 * cellSize)) * cellSize;
            imageRef.style.top = toPx(imgOffset);
            imageRef.style.left = toPx(imgOffset);
            imageRef.style.height = toPx(imgSize);
            imageRef.style.width = toPx(imgSize);

            // The modules under the logo are left out, so the shapes round off around it
            hole = { start: imgOffset / cellSize, size: imgSize / cellSize };
            setPicSize(Math.round(picSizeDefault / scale));
        }

        qrCodeCanvasRef!.innerHTML = renderSquircleQr(qr, cellSize, hole);
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
                <Show when={props.imageUrl || logo()}>
                    <ImageBackground ref={imageRef}>
                        <Show
                            when={logo()}
                            fallback={<ImageStyled src={props.imageUrl!} alt="" size={picSize()} />}
                        >
                            <LogoStyled onClick={(e: MouseEvent) => e.stopPropagation()}>
                                {logo()}
                            </LogoStyled>
                        </Show>
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
