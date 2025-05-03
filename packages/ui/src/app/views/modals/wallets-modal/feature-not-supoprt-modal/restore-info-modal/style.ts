import { styled } from 'solid-styled-components';
import { H1, H3, IconButton, Text } from 'src/app/components';

export const RestoreInfoModalStyled = styled.div`
    margin: 0 8px 16px 8px;
`;

export const StyledIconButton = styled(IconButton)`
    position: absolute;
    top: 16px;
    left: 16px;
`;

export const H1Styled = styled(H1)`
    margin-bottom: 18px;
    text-align: center;
`;

export const StepBlock = styled.div`
    padding: 16px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

export const IconWrapper = styled.div`
    margin-bottom: 12px;
`;

export const H3Styled = styled(H3)`
    text-align: center;
    margin-bottom: 4px;
`;

export const TextStyled = styled(Text)`
    text-align: center;
    max-width: 352px;
    color: ${props => props.theme!.colors.text.secondary};
`;

export const CircleNumber = styled.div`
    width: 44px;
    height: 44px;
    border-radius: 20px;
    background-color: ${props => props.theme?.colors.icon.secondary};
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
    font-weight: 700;
    font-size: 22px;
    color: ${props => props.theme?.colors.text.primary};
`;
