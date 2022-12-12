import { styled } from 'solid-styled-components';
import { H1, LoaderIcon, Modal } from 'src/app/components';
import { media } from 'src/app/styles/media';

export const ModalWrapper = styled.div`
    color: ${props => props.theme?.accentColor || 'blue'};
`;

export const StyledModal = styled(Modal)`
    padding-left: 0;
    padding-right: 0;

    ${media('mobile')} {
        min-height: 390px;
    }
`;

export const H1Styled = styled(H1)`
    margin-top: 12px;

    ${media('mobile')} {
        padding: 0 10px;
    }
`;

export const LoaderIconStyled = styled(LoaderIcon)`
    width: 70px;
    height: 70px;
`;

export const LoaderContainerStyled = styled.div`
    margin: 30px 0;
    width: 100%;
    display: flex;
    justify-content: center;

    ${media('mobile')} {
        height: 160px;
        align-items: center;
    }
`;
