import { styled } from 'solid-styled-components';
import { Button, H1, LoaderIcon, Text } from 'src/app/components';

/**
 * The icon and text sit 4px below the middle: 12px from the top and 28px above a button. A button
 * pulls 4px into the 8px padding under it, so it ends 28px above the sheet's edge, not 36px.
 */
export const ActionModalStyled = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px 0 8px;
`;

export const H1Styled = styled(H1)`
    margin-top: 16px;
    margin-bottom: 6px;
`;

export const TextStyled = styled(Text)`
    font-weight: 400;
    font-size: 16px;
    line-height: 21px;
    text-align: center;
    text-wrap: balance;
    max-width: 270px;

    color: ${props => props.theme!.colors.text.secondary};
`;

/**
 * Holds the place of the button that comes once the wallet answers: the same pill, with a spinner
 * in the label's colour centred where the label would be. The spinner's box is 24px, so the arc
 * itself is about 17px; it reaches 2px past the 20px line, which its negative margin takes back.
 */
export const LoaderButtonStyled = styled(Button)`
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 112px;
    margin-top: 28px;
    margin-bottom: -4px;
`;
export const LoaderIconStyled = styled(LoaderIcon)`
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    margin: -2px 0;
`;

export const ButtonStyled = styled(Button)`
    margin-top: 28px;
    margin-bottom: -4px;
`;
