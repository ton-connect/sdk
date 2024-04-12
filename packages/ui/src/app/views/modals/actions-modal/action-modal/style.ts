import { styled } from 'solid-styled-components';
import { Button, H1, LoaderIcon, Text } from 'src/app/components';

export const ActionModalStyled = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 8px;
`;

export const H1Styled = styled(H1)`
    margin-top: 16px;
`;

export const TextStyled = styled(Text)`
    font-weight: 510;
    font-size: 16px;
    line-height: 20px;
    text-align: center;
    max-width: 250px;

    color: ${props => props.theme!.colors.text.secondary};
`;

export const LoaderButtonStyled = styled(Button)`
    min-width: 112px;
    margin-top: 32px;
`;
export const LoaderIconStyled = styled(LoaderIcon)`
    height: 16px;
    width: 16px;
`;

export const ButtonStyled = styled(Button)`
    margin-top: 32px;
`;
