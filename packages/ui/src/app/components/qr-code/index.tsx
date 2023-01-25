import { Component, createEffect, createSignal, Show } from 'solid-js';
import { CopyButtonStyled, ImageBackground, QrCodeStyled } from './style';
import qrcode from 'qrcode-generator';
import { Transition } from 'solid-transition-group';
import { copyToClipboard } from 'src/app/utils/copy-to-clipboard';
import { Translation } from 'src/app/components/typography/Translation';

export interface QRCodeProps {
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

    createEffect(() => {
        const errorCorrectionLevel = 'L';
        const qr = qrcode(0, errorCorrectionLevel);
        qr.addData(props.sourceUrl);
        qr.make();
        qrCodeCanvas!.innerHTML = qr.createSvgTag(4);
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
        <QrCodeStyled
            onMouseEnter={() => setCopyButtonOpened(true)}
            onMouseLeave={() => {
                setCopyButtonOpened(false);
                setCopyButtonText(copyText);
            }}
        >
            <div ref={qrCodeCanvas} />
            <Show when={props.imageUrl}>
                <ImageBackground>
                    <img src={props.imageUrl} alt="" />
                </ImageBackground>
            </Show>
            <Transition
                onBeforeEnter={el => {
                    el.animate(
                        [
                            { opacity: 0, transform: 'translateY(56px)' },
                            { opacity: 1, transform: 'translateY(0)' }
                        ],
                        {
                            duration: 150
                        }
                    );
                }}
                onExit={(el, done) => {
                    el.animate(
                        [
                            { opacity: 1, transform: 'translateY(0)' },
                            { opacity: 0, transform: 'translateY(56px)' }
                        ],
                        {
                            duration: 150
                        }
                    ).finished.then(done);
                }}
            >
                <Show when={copyButtonOpened() && !props.disableCopy}>
                    {/* TODO i18n*/}
                    <CopyButtonStyled onClick={onCopyClick}>
                        <Translation translationKey={copyButtonText().translationKey}>
                            {copyButtonText().text}
                        </Translation>
                    </CopyButtonStyled>
                </Show>
            </Transition>
        </QrCodeStyled>
    );
};
