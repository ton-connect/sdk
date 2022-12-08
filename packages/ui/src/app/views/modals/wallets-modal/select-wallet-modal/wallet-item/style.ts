import { styled } from 'solid-styled-components';
import { Text } from 'src/app/components';
import { media } from 'src/app/styles/media';

export const WalletItemStyled = styled.button`
    cursor: pointer;
    display: block;
    border: none;
    background-color: unset;
    padding: 12px 12px 24px 12px;

    transition: transform 0.1s ease-in-out;

    &:hover {
        transform: scale(1.04);
    }

    &:active {
        transform: scale(0.96);
    }

    img {
        width: 72px;
        height: 72px;
        border-radius: 18px;

        margin-bottom: 8px;

        ${media('mobile')} {
            width: 64px;
            height: 64px;
            border-radius: 16px;
        }
    }

    ${media('mobile')} {
        padding: 10px 10px 20px 10px;
    }
`;

export const StyledText = styled(Text)`
    font-weight: 590;
    max-width: 72px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;

    @supports (-webkit-line-clamp: 2) {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: initial;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
    }
`;
