import type { Property } from 'csstype';
import { Component } from 'solid-js';
import { useTheme } from 'solid-styled-components';
import { Styleable } from 'src/app/models/styleable';

interface TelegramIconProps extends Styleable {
    fill?: Property.Color;
}

export const TelegramIcon: Component<TelegramIconProps> = props => {
    const theme = useTheme();
    const fill = (): string => props.fill || theme.colors.constant.white;

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="19"
            height="15"
            viewBox="0 0 19 15"
            fill="none"
            class={props.class}
        >
            <path
                d="M1.2441 6.45738C6.10346 4.34072 9.34298 2.94515 10.9628 2.27094C15.5929 0.345681 16.5539 0.011308 17.1815 0.000110129C17.3195 -0.00223361 17.6268 0.0318806 17.8273 0.19412C17.9939 0.330838 18.0409 0.515733 18.0643 0.64542C18.0851 0.775107 18.1138 1.07068 18.0904 1.30141C17.8404 3.93682 16.7544 10.3321 16.2024 13.2839C15.9706 14.5329 15.5096 14.9517 15.0643 14.9926C14.0956 15.0816 13.3612 14.353 12.4237 13.7386C10.9575 12.7769 10.1295 12.1785 8.70498 11.2402C7.05915 10.1558 8.12683 9.55972 9.06432 8.58576C9.30911 8.33082 13.5747 4.45192 13.6554 4.1001C13.6658 4.05609 13.6763 3.89203 13.5773 3.80557C13.481 3.71885 13.3377 3.74854 13.2335 3.77197C13.0851 3.80531 10.7439 5.35426 6.2023 8.41858C5.53824 8.87535 4.93669 9.098 4.39503 9.08628C3.80128 9.07352 2.65553 8.74982 1.80397 8.47326C0.762309 8.13394 -0.0684571 7.95452 0.00445919 7.37821C0.0409174 7.07822 0.455044 6.77118 1.2441 6.45738Z"
                fill={fill()}
            />
        </svg>
    );
};
