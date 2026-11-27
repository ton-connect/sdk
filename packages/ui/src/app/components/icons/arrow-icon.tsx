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

/**
 * A chevron drawn with the close icon's stroke and height, so the back and close buttons match.
 * It sits a little towards its tip: centred exactly, its open side makes it look off to that side.
 */
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
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            svgDirection={direction()}
        >
            <path
                d="M9.5 2.75L4.25 8L9.5 13.25"
                stroke={fill()}
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
        </Svg>
    );
};
