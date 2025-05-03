import { styled } from 'solid-styled-components';
import { H1, Modal, TabBar, Text } from 'src/app/components';
import { media } from 'src/app/styles/media';

export const StyledModal = styled(Modal)`
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 18px;
    padding-bottom: 0;

    ${media('mobile')} {
        padding-left: 0;
        padding-right: 0;
    }
`;

export const H1Styled = styled(H1)`
    margin-top: 12px;

    ${media('mobile')} {
        padding: 0 10px;
    }
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

export const TabTextStyled = styled(Text)`
    min-width: 84px;
    text-align: center;
    font-weight: 590;
`;

export const TabBarStyled = styled(TabBar)`
    margin: 0 auto 22px;
`;
