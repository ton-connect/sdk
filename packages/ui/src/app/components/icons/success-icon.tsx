import type { Property } from 'csstype';
import { Component } from 'solid-js';
import { Styleable } from 'src/app/models/styleable';
import { useTheme } from 'solid-styled-components';

export interface SuccessIconProps extends Styleable {
    fill?: Property.Color;
    size?: 'xs' | 's' | 'm';
}

export const SuccessIcon: Component<SuccessIconProps> = props => {
    const theme = useTheme();

    const size = (): 'xs' | 's' | 'm' => props.size || 's';
    const fill = (): string => props.fill || theme.colors.icon.success;

    return (
        <>
            {size() === 'xs' ? (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    class={props.class}
                >
                    <g clip-path="url(#clip0_3783_2045)">
                        <circle cx="8" cy="8.00098" r="8" fill={fill()} />
                        <path
                            d="M4.75 8.50098L7 10.751L11.75 6.00098"
                            stroke={theme.colors.constant.white}
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </g>
                    <defs>
                        <clipPath id="clip0_3783_2045">
                            <rect
                                width="16"
                                height="16"
                                fill="white"
                                transform="translate(0 0.000976562)"
                            />
                        </clipPath>
                    </defs>
                </svg>
            ) : size() === 's' ? (
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    class={props.class}
                >
                    <circle cx="12" cy="12" r="11" fill={fill()} />
                    <path
                        d="M17.1364 9.6364C17.4879 9.28493 17.4879 8.71508 17.1364 8.36361C16.7849 8.01214 16.2151 8.01214 15.8636 8.36361L10 14.2272L8.1364 12.3636C7.78493 12.0121 7.21508 12.0121 6.86361 12.3636C6.51214 12.7151 6.51214 13.2849 6.86361 13.6364L9.36361 16.1364C9.71508 16.4879 10.2849 16.4879 10.6364 16.1364L17.1364 9.6364Z"
                        fill={theme.colors.constant.white}
                    />
                </svg>
            ) : (
                <svg
                    width="72"
                    height="72"
                    viewBox="0 0 72 72"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    class={props.class}
                >
                    <circle cx="36" cy="36" r="33" fill={fill()} />
                    <path
                        d="M50.9142 28.4142C51.6953 27.6332 51.6953 26.3668 50.9142 25.5858C50.1332 24.8047 48.8668 24.8047 48.0858 25.5858L30 43.6716L23.9142 37.5858C23.1332 36.8047 21.8668 36.8047 21.0858 37.5858C20.3047 38.3668 20.3047 39.6332 21.0858 40.4142L28.5858 47.9142C29.3668 48.6953 30.6332 48.6953 31.4142 47.9142L50.9142 28.4142Z"
                        fill={theme.colors.constant.white}
                    />
                </svg>
            )}
        </>
    );
};
