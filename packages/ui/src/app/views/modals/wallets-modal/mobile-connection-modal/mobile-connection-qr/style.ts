import { sheetLayout } from 'src/app/styles/media';
import { sheetHeaderTitle } from 'src/app/components/icon-button/style';
import { styled } from 'solid-styled-components';
import { H1, H2, Button } from 'src/app/components';
import { BorderRadiusConfig } from 'src/app/models/border-radius-config';

const actionButtonBorderRadius: BorderRadiusConfig = {
    m: '26px',
    s: '12px',
    none: '0'
};

export const H1Styled = styled(H1)`
    margin-bottom: 20px;
    padding: 0 56px;
    font-size: 20px;

    ${sheetLayout} {
        ${sheetHeaderTitle}
        margin-bottom: 36px;
    }
`;

/** What to do with the code, under it and over the buttons it leads to. */
export const H2Styled = styled(H2)`
    margin: 0 0 32px;
    padding: 0 32px;
    font-size: 14px;
    line-height: 18px;
`;

export const QrCodeWrapper = styled.div`
    padding: 0 20px 14px;
`;

export const ButtonsWrapper = styled.div`
    display: flex;
    flex-direction: row;
    gap: 10px;
    padding: 0 20px 8px;
    margin-top: 0;
`;

export const ActionButton = styled(Button)`
    width: 100%;
    min-height: 52px;
    border-radius: ${props => actionButtonBorderRadius[props.theme!.borderRadius]};
    color: ${props => props.theme!.colors.text.primary};
    font-size: 16px;
    line-height: 20px;
    font-weight: 500;
    padding: 15px 20px 17px 20px;
`;
