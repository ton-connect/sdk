import { styled } from 'solid-styled-components';
import { rgba } from 'src/app/utils/css';
import { BorderRadiusConfig } from 'src/app/models/border-radius-config';

const borders: BorderRadiusConfig = {
    m: '100vh',
    s: '8px',
    none: '0'
};

export const ButtonStyled = styled.button<{ appearance: 'primary' | 'flat' }>`
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
        transform: ${props => (props.disabled ? 'unset' : 'scale(1.04)')};
    }

    &:active {
        transform: ${props => (props.disabled ? 'unset' : 'scale(0.96)')};
    }
`;
