import { Component, createEffect, createSignal, Show } from 'solid-js';
import {
    CopyButtonStyled,
    ImageBackground,
    QrCodeBackground,
    QRCodeBackgroundWrapper,
    QrCodeWrapper
} from './style';
import qrcode from 'qrcode-generator';
import { Transition } from 'solid-transition-group';
import { copyToClipboard } from 'src/app/utils/copy-to-clipboard';
import { Translation } from 'src/app/components/typography/Translation';
import { Styleable } from 'src/app/models/styleable';

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
    translationKey: '',
    text: 'Copy Link'
};

const copiedText: CopyButtonText = {
    translationKey: '',
    text: 'Copied!'
};

export const QRCode: Component<QRCodeProps> = props => {
    let qrCodeCanvas: HTMLDivElement | undefined;

    const [copyButtonOpened, setCopyButtonOpened] = createSignal(false);
    const [copyButtonText, setCopyButtonText] = createSignal<CopyButtonText>(copyText);
    let copyButtonHovered = false;

    createEffect(() => {
        const errorCorrectionLevel = 'L';
        const qr = qrcode(0, errorCorrectionLevel);
        qr.addData(props.sourceUrl);
        qr.make();
        qrCodeCanvas!.innerHTML = qr.createSvgTag(4, 0);
    });

    let timeoutId: null | ReturnType<typeof setTimeout> = null;
    const onCopyClick = (): void => {
        copyToClipboard(props.sourceUrl);
        setCopyButtonText(copiedText);

        if (timeoutId != null) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => setCopyButtonText(copyText), 5000);
    };

    return (
        <QRCodeBackgroundWrapper class={props.class}>
            <QrCodeBackground
                onMouseEnter={() => {
                    setCopyButtonOpened(true);
                }}
                onMouseLeave={() => {
                    setTimeout(() => {
                        if (!copyButtonHovered) {
                            setCopyButtonOpened(false);
                            setCopyButtonText(copyText);
                        }
                    });
                }}
            >
                <QrCodeWrapper>
                    <div ref={qrCodeCanvas} />
                    <Show when={props.imageUrl}>
                        <ImageBackground>
                            <img src={props.imageUrl} alt="" />
                        </ImageBackground>
                    </Show>
                </QrCodeWrapper>
            </QrCodeBackground>
            <Transition
                onBeforeEnter={el => {
                    el.animate(
                        [
                            { opacity: 0, transform: 'translate(-50%, 44px)' },
                            { opacity: 1, transform: 'translate(-50%, 0)' }
                        ],
                        {
                            duration: 150
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
                            duration: 150
                        }
                    ).finished.then(() => {
                        done();
                    });
                }}
            >
                <Show when={copyButtonOpened() && !props.disableCopy}>
                    {/* TODO i18n*/}
                    <CopyButtonStyled
                        onClick={onCopyClick}
                        onMouseEnter={() => (copyButtonHovered = true)}
                        onMouseLeave={() => (copyButtonHovered = false)}
                    >
                        <Translation translationKey={copyButtonText().translationKey}>
                            {copyButtonText().text}
                        </Translation>
                    </CopyButtonStyled>
                </Show>
            </Transition>
        </QRCodeBackgroundWrapper>
    );
};
