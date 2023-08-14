import { css, styled } from 'solid-styled-components';
import { IconButton } from 'src/app/components/icon-button';
import { maxWidth, media } from 'src/app/styles/media';
import { BorderRadiusConfig } from 'src/app/models/border-radius-config';
import { rgba } from 'src/app/utils/css';

export const borders: BorderRadiusConfig = {
    m: '24px',
    s: '16px',
    none: '0'
};

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

    @media (min-width: ${maxWidth.mobile.toString()}px) and (max-height: 600px) {
        padding: 48px 0;
        align-items: flex-start;
        overflow: scroll;
    }
`;

export const ModalWrapperClass = css`
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08), 0 16px 64px rgba(0, 0, 0, 0.16);
    width: fit-content;
`;

export const ModalBodyStyled = styled.div`
    position: relative;
    min-height: 100px;
    width: 416px;
    padding: 44px 56px 24px;

    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.04);

    background-color: ${props => props.theme!.colors.background.primary};
    border-radius: ${props => borders[props.theme!.borderRadius]};

    ${media('mobile')} {
        width: 100%;
        border-radius: ${props => borders[props.theme!.borderRadius]}
            ${props => borders[props.theme!.borderRadius]} 0 0;
    }

    ${media('mobile')} {
    }
`;

export const CloseButtonStyled = styled(IconButton)`
    position: absolute;
    right: 16px;
    top: 16px;
`;

export const ModalFooterStyled = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 16px 16px 18px;
    border-radius: 0 0 ${props => borders[props.theme!.borderRadius]}
        ${props => borders[props.theme!.borderRadius]};
`;

export const QuestionButtonStyled = styled(IconButton)`
    background-color: ${props => rgba(props.theme!.colors.icon.secondary, 0.12)};
`;
