import { css, styled } from 'solid-styled-components';
import { IconButton } from 'src/app/components/icon-button';
import { media } from 'src/app/styles/media';
import { BorderRadiusConfig } from 'src/app/models/border-radius-config';
import { rgba } from 'src/app/utils/css';

export const borders: BorderRadiusConfig = {
    m: '24px',
    s: '16px',
    none: '0'
};

export const ModalBackgroundStyled = styled.div`
    display: flex;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.4);
    padding: 20px 0;
    overflow-y: auto;

    ${media('mobile')} {
        padding-bottom: 0;
    }
`;

export const ModalWrapperClass = css`
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08), 0 16px 64px rgba(0, 0, 0, 0.16);
    width: fit-content;
    margin: auto;

    ${media('mobile')} {
        width: 100%;
        height: fit-content;
        margin: auto 0 0 0;
    }
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
