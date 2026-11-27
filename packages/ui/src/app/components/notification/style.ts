import { styled } from 'solid-styled-components';
import { Text } from 'src/app/components';
import { BorderRadiusConfig } from 'src/app/models/border-radius-config';

const borders: BorderRadiusConfig = {
    m: '16px',
    s: '8px',
    none: '0'
};
/** The icon sits on the header line, so one-line and multi-line notifications both look level. */
export const NotificationStyled = styled.div`
    width: 256px;
    padding: 14px 16px;
    display: flex;
    align-items: flex-start;
    gap: 9px;

    background-color: ${props => props.theme!.colors.background.primary};
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.16);
    border-radius: ${props => borders[props.theme!.borderRadius]};
`;

export const NotificationContentStyled = styled.div`
    width: 192px;

    > h3 {
        font-size: 15px;
    }
`;

export const TextStyled = styled(Text)`
    margin-top: 4px;
    color: ${props => props.theme!.colors.text.secondary};
`;
