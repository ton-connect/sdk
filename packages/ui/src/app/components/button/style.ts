import { styled } from 'solid-styled-components';
import { rgba } from 'src/app/utils/css';
import { BorderRadiusConfig } from 'src/app/models/border-radius-config';

const borders: BorderRadiusConfig = {
    m: '16px',
    s: '8px',
    none: '0'
};

export const ButtonStyled = styled.button`
    background-color: ${props => rgba(props.theme!.colors.accent, 0.12)};
    color: ${props => props.theme!.colors.accent};

    padding: 9px 16px;
    border: none;
    border-radius: ${props => borders[props.theme!.borderRadius]};
    cursor: pointer;

    font-size: 14px;
    font-weight: 590;
    line-height: 18px;
    letter-spacing: -0.154px;

    transition: transform 0.1s ease-in-out;

    &:hover {
        transform: scale(1.04);
    }

    &:active {
        transform: scale(0.96);
    }
`;
