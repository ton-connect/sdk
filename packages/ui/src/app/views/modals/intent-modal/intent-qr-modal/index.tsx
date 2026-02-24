import { Component, createSignal, onCleanup } from 'solid-js';
import { QRCode } from 'src/app/components';
import { Translation } from 'src/app/components/typography/Translation';
import { copyToClipboard } from 'src/app/utils/copy-to-clipboard';
import { openDeeplinkWithFallback, openLinkBlank } from 'src/app/utils/web-api';
import { QrCodeWrapper, ButtonsWrapper, H1Styled, H2Styled, ActionButton } from './styles';

interface IntentQRModalProps {
    universalLink: string;
    onClose: () => void;
}

export const IntentQRModal: Component<IntentQRModalProps> = props => {
    const [isCopiedShown, setIsCopiedShown] = createSignal<
        ReturnType<typeof setTimeout> | undefined
    >(undefined);

    const onCopy = async (): Promise<void> => {
        if (isCopiedShown() !== undefined) {
            clearTimeout(isCopiedShown()!);
        }

        await copyToClipboard(props.universalLink);
        const timeoutId = setTimeout(() => setIsCopiedShown(undefined), 1500);
        setIsCopiedShown(timeoutId);
    };

    onCleanup(() => {
        if (isCopiedShown() !== undefined) {
            clearTimeout(isCopiedShown()!);
        }
    });

    const onOpenLink = (): void => {
        // For tc:// deep links, use openDeeplinkWithFallback
        // This will try to open the deep link and fallback to opening in a new tab if needed
        if (props.universalLink.startsWith('tc://')) {
            openDeeplinkWithFallback(props.universalLink, () => {
                // Fallback: if deep link doesn't work, try to open in new tab
                // Note: This may not work for all browsers, but provides a fallback
                try {
                    openLinkBlank(props.universalLink);
                } catch (e) {
                    // If all else fails, just copy to clipboard
                    onCopy();
                }
            });
        } else {
            // For regular URLs, open in new tab
            openLinkBlank(props.universalLink);
        }
    };

    return (
        <>
            <H1Styled>
                <Translation translationKey="walletModal.mobileUniversalModal.scan">
                    Scan with your mobile wallet
                </Translation>
            </H1Styled>
            <H2Styled>
                <Translation translationKey="walletModal.mobileUniversalModal.connectYourWalletIntent">
                    Complete in wallet
                </Translation>
            </H2Styled>
            <QrCodeWrapper>
                <QRCode sourceUrl={props.universalLink} disableCopy />
            </QrCodeWrapper>
            <ButtonsWrapper>
                <ActionButton appearance="secondary" onClick={onOpenLink}>
                    <Translation translationKey="walletModal.mobileUniversalModal.openLink">
                        Open Link
                    </Translation>
                </ActionButton>
                <ActionButton appearance="secondary" onClick={onCopy}>
                    <Translation
                        translationKey={
                            isCopiedShown() !== undefined ? 'common.copied' : 'common.copyLink'
                        }
                    >
                        {isCopiedShown() !== undefined ? 'Copied' : 'Copy Link'}
                    </Translation>
                </ActionButton>
            </ButtonsWrapper>
        </>
    );
};
