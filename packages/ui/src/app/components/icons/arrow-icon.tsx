import type { Property } from 'csstype';
import { Component } from 'solid-js';
import { styled, useTheme } from 'solid-styled-components';

interface ArrowIconProps {
    fill?: Property.Color;
    direction?: 'left' | 'right' | 'top' | 'bottom';
}

const rotationDegrees = {
    left: 0,
    top: 90,
    right: 180,
    bottom: 270
};

export const ArrowIcon: Component<ArrowIconProps> = props => {
    const theme = useTheme();
    const fill = (): Property.Color => props.fill || theme.colors.icon.secondary;
    const direction = (): 'left' | 'right' | 'top' | 'bottom' => props.direction || 'left';

    const Svg = styled('svg')<{ svgDirection: 'left' | 'right' | 'top' | 'bottom' }>`
        transform: rotate(${props => rotationDegrees[props.svgDirection]}deg);
        transition: transform 0.1s ease-in-out;
    `;

    return (
        <Svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            svgDirection={direction()}
        >
            <path
                d="M9.1 3.40012L5.5 8.0001L9.1 12.6001"
                stroke={fill()}
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
        </Svg>
    );
};
