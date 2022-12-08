import { styled } from 'solid-styled-components';
import { Modal } from 'src/app/components';
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
