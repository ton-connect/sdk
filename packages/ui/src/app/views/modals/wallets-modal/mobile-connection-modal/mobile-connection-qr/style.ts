import { styled } from 'solid-styled-components';
import { H1, H2, Button } from 'src/app/components';
import { BorderRadiusConfig } from 'src/app/models/border-radius-config';
import { rgba } from 'src/app/utils/css';

const actionButtonBorderRadius: BorderRadiusConfig = {
    m: '16px',
    s: '8px',
    none: '0'
};

export const H1Styled = styled(H1)`
    margin-bottom: 2px;
    padding: 0 52px;
`;

export const H2Styled = styled(H2)`
    margin-bottom: 20px;
    padding: 0 64px;
`;

export const QrCodeWrapper = styled.div`
    padding: 0 24px 16px;
`;

export const ButtonsWrapper = styled.div`
    display: flex;
    flex-direction: row;
    gap: 16px;
    padding: 0 24px 24px;
    margin-top: 0;
`;

export const ActionButton = styled(Button)`
    width: 100%;
    height: 56px;
    border-radius: ${props => actionButtonBorderRadius[props.theme!.borderRadius]};
    background-color: ${props => rgba(props.theme!.colors.accent, 0.12)};
    color: ${props => props.theme!.colors.accent};
    font-size: 16px;
    line-height: 20px;
    font-weight: 500;
    padding: 17px 20px 19px 20px;
`;
