import { styled } from 'solid-styled-components';
import { rgba } from 'src/app/utils/css';
import { BorderRadiusConfig } from 'src/app/models/border-radius-config';
import { mediaTouch } from 'src/app/styles/media';

const borders: BorderRadiusConfig = {
    m: '100vh',
    s: '8px',
    none: '0'
};

const scaleValues = {
    s: 0.02,
    m: 0.04
};

export const ButtonStyled = styled.button<{ appearance: 'primary' | 'flat'; scale: 's' | 'm' }>`
    background-color: ${props =>
        props.appearance === 'flat' ? 'transparent' : rgba(props.theme!.colors.accent, 0.12)};
    color: ${props => props.theme!.colors.accent};

    padding: ${props => (props.appearance === 'flat' ? '0' : '9px 16px')};
    border: none;
    border-radius: ${props => borders[props.theme!.borderRadius]};
    cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};

    font-size: 14px;
    font-weight: 590;
    line-height: 18px;

    transition: transform 0.125s ease-in-out;

    &:hover {
        transform: ${props =>
            props.disabled ? 'unset' : `scale(${1 + scaleValues[props.scale]})`};
    }

    &:active {
        transform: ${props =>
            props.disabled ? 'unset' : `scale(${1 - scaleValues[props.scale]})`};
    }

    ${mediaTouch} {
        &:hover,
        &:active {
            transform: ${props =>
                props.disabled ? 'unset' : `scale(${1 - scaleValues[props.scale] * 2})`};
        }
    }
`;
