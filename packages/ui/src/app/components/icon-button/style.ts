import { styled } from 'solid-styled-components';
import { mediaNotTouch, mediaTouch } from 'src/app/styles/media';
import { chip } from 'src/app/styles/chip';
import { PRESS_TRANSITION } from 'src/app/styles/motion';

export const IconButtonStyled = styled.button`
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    ${props => chip(props.theme!, 0.32)}
    cursor: pointer;

    transition: ${PRESS_TRANSITION};

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

/** The round buttons at the top of the phone sheet: larger, with icons grown to match. */
export const sheetIconButton = `
    width: 44px;
    height: 44px;

    & > svg {
        width: 22px;
        height: 22px;
    }
`;

const headerTitleType = `
    padding-left: 68px;
    padding-right: 68px;
    font-size: 17px;
    line-height: 22px;
    letter-spacing: -0.4px;
`;

/**
 * A title alone on the row of the round buttons at the top of the phone sheet. It is set like a
 * navigation bar title, centred on the buttons, and stops 8px short of them on both sides.
 */
export const sheetHeaderTitle = `
    ${headerTitleType}
    margin-top: 7px;
`;
