import { styled } from 'solid-styled-components';
import { H1, H3, IconButton, Text } from 'src/app/components';
import { sheetHeaderTitle, sheetIconButton } from 'src/app/components/icon-button/style';
import { plainFill } from 'src/app/components/button/style';
import { sheetLayout } from 'src/app/styles/media';

export const RestoreInfoModalStyled = styled.div`
    margin: 0 8px 16px 8px;
`;

/** The back button, the same size as the close button opposite it. */
export const StyledIconButton = styled(IconButton)`
    position: absolute;
    top: 16px;
    left: 16px;

    ${sheetLayout} {
        ${sheetIconButton}
    }
`;

export const H1Styled = styled(H1)`
    margin-bottom: 18px;
    text-align: center;

    ${sheetLayout} {
        ${sheetHeaderTitle}
    }
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

/** The step number on the light pill of secondary buttons, not a solid grey disc. */
export const CircleNumber = styled.div`
    width: 44px;
    height: 44px;
    border-radius: 50%;
    ${props => plainFill(props.theme!)}
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
    font-weight: 500;
    font-size: 22px;
    color: ${props => props.theme?.colors.text.primary};
`;
