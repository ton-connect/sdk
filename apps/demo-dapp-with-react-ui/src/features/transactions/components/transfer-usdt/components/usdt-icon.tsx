import type { FC } from 'react';

interface UsdtIconProps {
    size?: number;
}

export const UsdtIcon: FC<UsdtIconProps> = ({ size = 36 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
    >
        <circle cx="18" cy="18" r="18" fill="#26A17B" />
        <path
            d="M19.94 19.31v-.01c-.1.01-.66.04-1.91.04-1 0-1.7-.03-1.94-.04v.01c-3.85-.17-6.72-.84-6.72-1.65 0-.8 2.87-1.48 6.72-1.65v2.63c.25.02.96.06 1.95.06 1.2 0 1.79-.05 1.9-.06v-2.63c3.84.17 6.7.85 6.7 1.65 0 .8-2.86 1.48-6.7 1.65zm0-3.57v-2.36h5.4V9.78H10.6v3.6h5.4v2.36C11.62 15.94 8.4 16.81 8.4 17.84c0 1.04 3.22 1.91 7.6 2.1v7.57h3.94v-7.56c4.37-.2 7.59-1.07 7.59-2.1 0-1.04-3.22-1.91-7.6-2.11z"
            fill="#FFFFFF"
        />
    </svg>
);
