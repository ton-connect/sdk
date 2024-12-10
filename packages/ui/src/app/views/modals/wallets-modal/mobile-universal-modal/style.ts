import { styled } from 'solid-styled-components';
import { Button, H1, H2, IconButton, Image } from 'src/app/components';
import { mediaNotTouch, mediaTouch } from 'src/app/styles/media';
import { BorderRadiusConfig } from 'src/app/models/border-radius-config';

const borders: BorderRadiusConfig = {
    m: '16px',
    s: '12px',
    none: '0'
};

const tgBorders: BorderRadiusConfig = {
    m: '6px',
    s: '6px',
    none: '0'
};

export const OtherOptionButton = styled.li`
    width: 82px;
    min-width: 82px;
    height: 124px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 4px;

    text-align: center;
    cursor: pointer;

    transition: transform 0.1s ease-in-out;

    ${mediaNotTouch} {
        &:hover {
            transform: scale(1.04);
        }
    }

    &:active {
        transform: scale(0.96);
    }

    ${mediaTouch} {
        &:active {
            transform: scale(0.92);
        }
    }
`;

export const H1Styled = styled(H1)`
    margin-top: 38px;
    margin-bottom: 4px;
    padding: 0 24px;
`;

export const H2Styled = styled(H2)<{
    maxWidth?: number;
    minHeight?: string;
    padding?: string;
    margin?: string;
}>`
    margin: ${props => props.margin ?? '0 0 28px 0'};
    padding: ${props => props.padding ?? '0 24px'};
    min-height: ${props => props.padding ?? '44px'};
    max-width: ${props => props.maxWidth}px;
    margin-left: ${props => (props.maxWidth ? 'auto' : '0px')};
    margin-right: ${props => (props.maxWidth ? 'auto' : '0px')};
`;

export const ButtonStyled = styled(Button)`
    display: block;
    margin: 0 auto;
`;

export const TelegramButtonStyled = styled(Button)`
    margin: 0 28px 24px;
    width: calc(100% - 56px);
    border-radius: ${props => borders[props.theme!.borderRadius]};
    padding: 14px 16px 14px 14px;
    background-color: ${props => props.theme!.colors.telegramButton};

    color: ${props => props.theme!.colors.constant.white};
    font-weight: 500;
    font-size: 16px;
    line-height: 20px;

    @media (max-width: 375px) {
        margin: 0 16px 24px;
        width: calc(100% - 32px);
    }
`;

export const TGImageStyled = styled(Image)`
    background-color: transparent;
    border-radius: ${props => tgBorders[props.theme!.borderRadius]};
    width: 24px;
    height: 24px;
`;

export const StyledLeftActionButton = styled(IconButton)`
    position: absolute;
    top: 16px;
    left: 16px;
`;
