import { styled } from 'solid-styled-components';
import { BorderRadiusConfig } from 'src/app/models/border-radius-config';

const wrapperBorderRadius: BorderRadiusConfig = {
    m: '22px',
    s: '12px',
    none: '0'
};

const sliderBorderRadius: BorderRadiusConfig = {
    m: '18px',
    s: '8px',
    none: '0'
};

export const TabBarStyled = styled.div`
    display: grid;
    grid-template: 1fr / 1fr 1fr;
    width: fit-content;
    justify-items: center;
    gap: 4px;

    position: relative;
    padding: 4px;
    border-radius: ${props => wrapperBorderRadius[props.theme!.borderRadius]};

    background-color: ${props => props.theme!.colors.background.secondary};
`;

export const SliderStyled = styled.div<{ right: boolean }>`
    position: absolute;
    top: 4px;
    left: 4px;

    height: calc(100% - 8px);
    width: calc(50% - 4px);

    border-radius: ${props => sliderBorderRadius[props.theme!.borderRadius]};
    background-color: ${props => props.theme!.colors.background.segment};

    transform: ${props => (props.right ? 'translateX(100%)' : 'translateX(0)')};

    transition: transform 0.13s ease-in-out;
`;

export const InputStyled = styled.input`
    display: none;
`;

export const LabelStyled = styled.label<{ isActive: boolean }>`
    padding: 9px 12px;
    z-index: 1;

    cursor: ${props => (props.isActive ? 'default' : 'pointer')};

    transition: transform 0.13s ease-in-out;

    &:hover {
        transform: ${props => (props.isActive ? 'none' : 'scale(1.025)')};
    }

    > * {
        ${props => (!props.isActive ? `color: ${props.theme!.colors.text.secondary};` : '')}
    }
`;
