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

export const UlStyled = styled.ul`
    display: flex;
    justify-content: space-between;
    margin: 0 auto;
    width: fit-content;
    max-width: 100%;
    min-width: 100%;
    height: fit-content;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 0 13px 24px;

    &&::-webkit-scrollbar {
        display: none;
    }

    -ms-overflow-style: none;
    scrollbar-width: none;

    > li {
        height: fit-content;
    }
`;

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

export const Divider = styled.div`
    width: 1px;
    margin: 0 10px;
    height: 24px;
    position: relative;
    top: 26px;

    background-color: ${props => props.theme!.colors.icon.secondary};
    opacity: 0.2;
`;

export const IconContainer = styled.div`
    width: 60px;
    height: 60px;
    border-radius: ${props => borders[props.theme!.borderRadius]};
    display: flex;
    align-items: center;
    justify-content: center;

    background-color: ${props => props.theme!.colors.background.tint};
    margin-bottom: 8px;
`;

export const H1Styled = styled(H1)`
    margin-top: 38px;
    margin-bottom: 4px;
    padding: 0 24px;
`;

export const H2Styled = styled(H2)<{ maxWidth?: number }>`
    margin-bottom: 24px;
    padding: 0 24px;
    min-height: 44px;
    max-width: ${props => props.maxWidth}px;
    margin-left: ${props => (props.maxWidth ? 'auto' : '0px')};
    margin-right: ${props => (props.maxWidth ? 'auto' : '0px')};
`;

export const ButtonStyled = styled(Button)`
    display: block;
    margin: 0 auto;
`;

export const TelegramButtonStyled = styled(Button)`
    margin: 0 24px 24px;
    width: calc(100% - 48px);
    border-radius: ${props => borders[props.theme!.borderRadius]};
    padding: 14px 16px 14px 14px;
    background-color: ${props => props.theme!.colors.telegramButton};

    color: ${props => props.theme!.colors.constant.white};
    font-weight: 510;
    font-size: 16px;
    line-height: 20px;
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
