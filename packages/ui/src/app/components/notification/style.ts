import { styled } from 'solid-styled-components';
import { Text } from 'src/app/components';

export const NotificationStyled = styled.div`
    width: 256px;
    padding: 12px 16px;
    display: flex;
    gap: 9px;

    background-color: ${props => props.theme!.colors.backgroundPrimary};
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.16);
    border-radius: 16px;
`;

export const TextStyled = styled(Text)`
    margin-top: 4px;
    color: ${props => props.theme!.colors.font.secondary};
`;
