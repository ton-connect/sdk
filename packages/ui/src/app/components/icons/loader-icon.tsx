import cn from 'classnames';
import type { Property } from 'csstype';
import { Component } from 'solid-js';
import {css, keyframes, useTheme} from 'solid-styled-components';
import { Styleable } from 'src/app/models/styleable';

export interface LoaderIconProps extends Styleable {
    fill?: Property.Color;
}

export const LoaderIcon: Component<LoaderIconProps> = props => {
    const theme = useTheme();
    const fill = (): string => props.fill || theme.colors.icon.tertiary;

    const rotateAnimation = keyframes`
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
    `;

    const svgClass = css`
        animation: ${rotateAnimation} 1s linear infinite;
    `;

    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class={cn(svgClass, props.class)}
        >
            <path
                d="M8.00002 18.9282C11.8264 21.1373 16.7191 19.8263 18.9282 16C21.1374 12.1736 19.8264 7.28092 16 5.07178C12.1737 2.86264 7.28096 4.17364 5.07182 7.99998"
                stroke={fill()}
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
        </svg>
    );
};
