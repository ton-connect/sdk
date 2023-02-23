import { styled } from 'solid-styled-components';
import { Text } from '../typography/text';
import { Image } from '../image';
import { media } from 'src/app/styles/media';
export const WalletItemStyled = styled.button`
    cursor: pointer;
    border: none;
    background-color: unset;
    padding: 12px 8px 8px;
    height: 94px;
    width: 92px;
    display: flex;
    flex-direction: column;
    align-items: center;

    transition: transform 0.1s ease-in-out;

    &:hover {
        transform: scale(1.04);
    }

    &:active {
        transform: scale(0.96);
    }

    ${media('mobile')} {
        padding: 8px 4px;
        height: 124px;
        width: 82px;
    }
`;

export const ImageStyled = styled(Image)`
    width: 48px;
    height: 48px;
    border-radius: 12px;

    margin-bottom: 8px;

    ${media('mobile')} {
        width: 64px;
        height: 64px;
        border-radius: 16px;
    }
`;

export const StyledText = styled(Text)`
    font-weight: 590;
    max-width: 76px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
`;
