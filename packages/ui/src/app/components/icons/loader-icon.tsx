import cn from 'classnames';
import type { Property } from 'csstype';
import { Component } from 'solid-js';
import { css, keyframes } from 'solid-styled-components';
import { Styleable } from 'src/app/models/styleable';

export interface LoaderIconProps extends Styleable {
    fill?: Property.Color;
}

export const LoaderIcon: Component<LoaderIconProps> = props => {
    const fill = (): string => props.fill || '#7A8999';

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
            width="17"
            height="18"
            viewBox="0 0 17 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class={cn(svgClass, props.class)}
        >
            <path
                d="M4.00002 15.9282C7.82636 18.1373 12.7191 16.8263 14.9282 13C17.1374 9.17364 15.8264 4.28092 12 2.07178C8.17368 -0.137363 3.28096 1.17364 1.07182 4.99998"
                stroke={fill()}
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
        </svg>
    );
};
