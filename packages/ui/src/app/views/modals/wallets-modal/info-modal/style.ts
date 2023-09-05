import { css, styled } from 'solid-styled-components';
import { H1, H3, IconButton, Text } from 'src/app/components';
import {ScrollContainer} from "src/app/components/scroll-container";

export const InfoModalStyled = styled.div``;

export const StyledIconButton = styled(IconButton)`
    position: absolute;
    top: 16px;
    left: 16px;
`;

export const H1Styled = styled(H1)`
    margin-bottom: 18px;
`;

export const InfoBlock = styled.div`
    padding: 16px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

export const InfoBlockIconClass = css`
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

export const ButtonsBlock = styled.div`
    padding: 16px 24px 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
`;
