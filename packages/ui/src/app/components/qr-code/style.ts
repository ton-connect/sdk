import { styled } from 'solid-styled-components';
import { Image } from 'src/app/components';
import { BorderRadiusConfig } from 'src/app/models/border-radius-config';
import { toPx } from 'src/app/utils/css';
import { mediaNotTouch, mediaTouch, sheetLayout } from 'src/app/styles/media';
import { PRESS_TRANSITION } from 'src/app/styles/motion';

const backgroundBorders: BorderRadiusConfig = {
    m: '28px',
    s: '14px',
    none: '0'
};

const imageBorders: BorderRadiusConfig = {
    m: '12px',
    s: '8px',
    none: '0'
};

/** The side of the code where the box is no wider than it needs to be. */
export const qrNormalSize = 256;
export const imgSizeDefault = 60;

export const picSizeDefault = 48;

/** The white margin around the code, the same on every side. */
const qrPadding = 16;
// With the copy button in the corner the margin is wide enough to hold it clear of the code
const qrPaddingWithCopy = 40;
// In dialogs the box stops a little wider than the default code, with room for the copy button
const qrBoxMaxSize = qrNormalSize + qrPaddingWithCopy * 2;
// On phones the code is a little smaller than the default, centred in the sheet
const qrSheetBoxSize = 272;

export const CopyIconButton = styled.div`
    width: 52px;
    height: 52px;
    background: transparent;
    position: absolute;
    right: 0;
    bottom: 0;

    display: flex;
    align-items: center;
    justify-content: center;
    transition: ${PRESS_TRANSITION};
`;

export const QrCodeBackground = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    background-color: ${props => props.theme!.colors.background.qr};
    border-radius: ${props => backgroundBorders[props.theme!.borderRadius]};
    padding: ${toPx(qrPadding)};

    &[data-tc-qr-copy='true'] {
        padding: ${toPx(qrPaddingWithCopy)};
    }
    width: 100%;
    max-width: ${toPx(qrBoxMaxSize)};
    aspect-ratio: 1;
    margin: 0 auto;

    ${sheetLayout} {
        max-width: ${toPx(qrSheetBoxSize)};
    }

    overflow: hidden;
    cursor: pointer;
    border: none;

    ${mediaNotTouch} {
        &:hover {
            ${CopyIconButton.class} {
                transform: scale(1.04);
            }
        }
    }

    &:active {
        ${CopyIconButton.class} {
            transform: scale(0.96);
        }
    }

    ${mediaTouch} {
        &:active {
            ${CopyIconButton.class} {
                transform: scale(0.92);
            }
        }
    }
`;

/**
 * The code at its drawn size, scaled to fit by a transform. It must not shrink in the layout first:
 * squeezed, the code would be narrower than the space its logo is placed in, and the logo off-centre.
 */
export const QrCodeWrapper = styled.div`
    position: relative;
    flex-shrink: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto;

    > div:first-child {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    rect {
        fill: transparent;
    }

    path {
        fill: ${props => props.theme!.colors.constant.black};
    }
`;

// No backdrop: the modules under the logo are not drawn, and a square would cut the shapes around it
export const ImageBackground = styled.div`
    position: absolute;
    width: ${toPx(imgSizeDefault)};
    height: ${toPx(imgSizeDefault)};

    display: flex;
    align-items: center;
    justify-content: center;
`;

/** Centred on the cleared middle even when it is larger than it, as the diamond's box is. */
export const LogoStyled = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    display: flex;
    transform: translate(-50%, -50%);
`;

export const ImageStyled = styled(Image)<{ size: number }>`
    width: ${props => toPx(props.size)};
    height: ${props => toPx(props.size)};
    border-radius: ${props => imageBorders[props.theme!.borderRadius]};
    background-color: ${props => props.theme!.colors.background.qr};
`;

export const CopiedBoxStyled = styled.div`
    position: absolute;
    bottom: 14px;
    left: 50%;
    transform: translate(-50%, 0);

    display: flex;
    gap: 6px;
    align-items: center;
    border-radius: 18px;
    min-width: 126px;
    padding: 9px 16px 9px 10px;

    filter: drop-shadow(0px 2px 8px rgba(0, 0, 0, 0.08));
    background-color: ${props => props.theme!.colors.background.segment};
`;
