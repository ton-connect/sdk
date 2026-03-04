import { styled } from 'solid-styled-components';
import { Button } from 'src/app/components';
import { BorderRadiusConfig } from 'src/app/models/border-radius-config';
import { rgba } from 'src/app/utils/css';

const actionButtonBorderRadius: BorderRadiusConfig = {
    m: '16px',
    s: '8px',
    none: '0'
};

export const QrCodeWrapper = styled.div`
    display: flex;
    justify-content: center;
    margin: 24px 0;
`;

export const ButtonsWrapper = styled.div`
    display: flex;
    gap: 12px;
    margin-top: 24px;
`;

export const H1Styled = styled.h1`
    font-weight: 600;
    font-size: 20px;
    line-height: 28px;
    text-align: center;
    margin: 0 0 8px 0;
`;

export const H2Styled = styled.h2`
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    text-align: center;
    color: ${props => props.theme?.colors?.textSecondary || '#b8d4f1'};
    margin: 0 0 24px 0;
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
