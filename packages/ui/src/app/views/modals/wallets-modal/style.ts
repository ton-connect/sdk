import { sheetLayout } from 'src/app/styles/media';
import { styled } from 'solid-styled-components';
import { H1, Modal, TabBar } from 'src/app/components';

export const StyledModal = styled(Modal)`
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 18px;
    padding-bottom: 16px;

    ${sheetLayout} {
        padding-left: 0;
        padding-right: 0;
    }
`;

export const H1Styled = styled(H1)`
    margin-top: 12px;

    ${sheetLayout} {
        padding: 0 10px;
    }
`;

export const LoaderContainerStyled = styled.div`
    margin: 30px 0;
    width: 100%;
    display: flex;
    justify-content: center;

    ${sheetLayout} {
        height: 160px;
        align-items: center;
    }
`;

export const TabBarStyled = styled(TabBar)`
    margin: 0 auto 22px;
`;
