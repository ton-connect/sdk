import { styled } from 'solid-styled-components';
import { Button, H1, Text } from 'src/app/components';

export const ActionModalStyled = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 20px;
`;

export const H1Styled = styled(H1)`
    margin-top: 19px;
`;

export const TextStyled = styled(Text)`
    font-weight: 510;
    font-size: 16px;
    line-height: 22px;
    letter-spacing: -0.32px;
    text-align: center;
    max-width: 250px;

    color: ${props => props.theme!.colors.text.secondary};
`;

export const ButtonStyled = styled(Button)`
    margin-top: 32px;
`;
