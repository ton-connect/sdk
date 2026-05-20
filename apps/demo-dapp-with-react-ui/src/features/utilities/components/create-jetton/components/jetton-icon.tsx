import type { FC } from 'react';

interface JettonIconProps {
    size?: number;
}

export const JettonIcon: FC<JettonIconProps> = ({ size = 36 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
    >
        <circle cx="18" cy="18" r="18" fill="#6366F1" />
        <text
            x="18"
            y="18"
            textAnchor="middle"
            dominantBaseline="central"
            fill="#FFFFFF"
            fontSize="11"
            fontWeight="700"
            fontFamily="system-ui, sans-serif"
        >
            JPEG
        </text>
    </svg>
);
