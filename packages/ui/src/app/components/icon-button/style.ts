import { styled } from 'solid-styled-components';
import { mediaNotTouch, mediaTouch } from 'src/app/styles/media';

export const IconButtonStyled = styled.button`
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: ${props => props.theme!.colors.background.tint};
    border: none;
    cursor: pointer;

    transition: transform 0.125s ease-in-out;

    ${mediaNotTouch} {
        &:hover {
            transform: scale(1.04);
        }
    }

    &:active {
        transform: scale(0.96);
    }

    ${mediaTouch} {
        &:active {
            transform: scale(0.92);
        }
    }
`;
