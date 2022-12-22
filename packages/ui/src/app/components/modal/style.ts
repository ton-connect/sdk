import { css, styled } from 'solid-styled-components';
import { IconButton } from 'src/app/components/icon-button';
import { media } from 'src/app/styles/media';

export const ModalBackgroundStyled = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.4);

    ${media('mobile')} {
        align-items: flex-end;
    }
`;

export const ModalWrapperClass = css`
    position: relative;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08), 0 16px 64px rgba(0, 0, 0, 0.16);
    border-radius: 24px;
    min-height: 100px;
    width: 440px;
    padding: 44px 56px 24px;

    ${media('mobile')} {
        width: 100%;
        border-radius: 24px 24px 0 0;
    }
`;

export const CloseButtonStyled = styled(IconButton)`
    position: absolute;
    right: 16px;
    top: 16px;
`;
