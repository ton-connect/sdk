import { css, DefaultTheme, styled } from 'solid-styled-components';
import { sheetIconButton } from 'src/app/components/icon-button/style';
import { IconButton } from 'src/app/components/icon-button';
import { BorderRadiusConfig } from 'src/app/models/border-radius-config';
import { THEME } from 'src/models/THEME';
import { sheetLayout } from 'src/app/styles/media';

export const borders: BorderRadiusConfig = {
    m: '24px',
    s: '16px',
    none: '0'
};

/** Corners of the phone sheet, which floats clear of the screen edges like Telegram's sheets. */
export const sheetBorders: BorderRadiusConfig = {
    m: '40px',
    s: '28px',
    none: '0'
};

/** Dims the dApp page under the modal; lighter in light themes, where the glass is pale. */
export function overlayColor(theme: DefaultTheme): string {
    return theme.theme === THEME.DARK ? 'rgba(0, 0, 0, 0.42)' : 'rgba(10, 14, 22, 0.2)';
}

export const ModalBackgroundStyled = styled.div`
    display: flex;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: ${props => overlayColor(props.theme!)};
    padding: 20px 0;
    overflow-y: auto;

    &[data-tc-layout='sheet'] {
        padding-bottom: 0;
    }
`;

/**
 * On phones the sheet floats 8px above the bottom edge, as iOS sheets do: the home indicator sits
 * over its bottom padding rather than pushing the whole sheet up by the safe area.
 */
export const ModalWrapperClass = css`
    width: fit-content;
    margin: auto;
    overflow: hidden;

    ${sheetLayout} {
        width: calc(100% - 16px);
        max-width: 440px;
        height: fit-content;
        margin: auto auto 8px;
    }
`;

export const ModalBodyStyled = styled.div`
    position: relative;
    min-height: 100px;
    width: 416px;
    padding: 44px 56px 24px;

    ${sheetLayout} {
        width: 100%;
        padding-top: 20px;
    }
`;

export const CloseButtonStyled = styled(IconButton)`
    position: absolute;
    right: 16px;
    top: 16px;

    ${sheetLayout} {
        ${sheetIconButton}
    }
`;
