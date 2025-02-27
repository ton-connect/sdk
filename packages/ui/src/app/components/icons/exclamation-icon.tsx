import type { Property } from 'csstype';
import { Component } from 'solid-js';
import { Styleable } from 'src/app/models/styleable';
import { useTheme } from 'solid-styled-components';

export interface ExclamationIconProps extends Styleable {
    fill?: Property.Color;
    size: '16' | '28';
}

export const ExclamationIcon: Component<ExclamationIconProps> = props => {
    const theme = useTheme();

    const size = (): '16' | '28' => props.size;
    const fill = (): string => props.fill || theme.colors.icon.error;

    return (
        <>
            {size() === '16' ? (
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <g clip-path="url(#clip0_5122_10355)">
                        <circle cx="8" cy="8" r="8" fill={fill()} />
                        <circle cx="8" cy="11" r="1" fill={theme.colors.constant.white} />
                        <path
                            d="M7.04994 4.99875C7.02277 4.45542 7.45598 4 8 4C8.54402 4 8.97723 4.45541 8.95006 4.99875L8.78745 8.25094C8.76647 8.67055 8.42014 9 8 9C7.57986 9 7.23353 8.67055 7.21255 8.25094L7.04994 4.99875Z"
                            fill={theme.colors.constant.white}
                        />
                    </g>
                    <defs>
                        <clipPath id="clip0_5122_10355">
                            <rect width="16" height="16" fill={theme.colors.constant.white} />
                        </clipPath>
                    </defs>
                </svg>
            ) : size() === '28' ? (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 28 28"
                    fill="none"
                    class={props.class}
                >
                    <circle cx="14" cy="14" r="12" fill={fill()} />
                    <circle cx="14" cy="18.9" r="1.4" fill={theme.colors.constant.white} />
                    <path
                        d="M12.6658 8.89845C12.63 8.13698 13.2377 7.5 14 7.5C14.7623 7.5 15.37 8.13698 15.3342 8.89845L15.047 15.0013C15.0207 15.5604 14.5597 16.0002 14 16.0002C13.4403 16.0002 12.9793 15.5604 12.953 15.0013L12.6658 8.89845Z"
                        fill={theme.colors.constant.white}
                    />
                </svg>
            ) : null}
        </>
    );
};
