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
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            svgDirection={direction()}
        >
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M10.2122 14.3407C10.5384 14.0854 10.5959 13.614 10.3406 13.2878L6.20237 8.00003L10.3406 2.71227C10.5959 2.38607 10.5384 1.91469 10.2122 1.6594C9.88604 1.40412 9.41465 1.46161 9.15937 1.7878L4.65937 7.5378C4.44688 7.80932 4.44688 8.19074 4.65937 8.46226L9.15937 14.2123C9.41465 14.5385 9.88604 14.5959 10.2122 14.3407Z"
                fill={fill()}
            />
        </Svg>
    );
};
