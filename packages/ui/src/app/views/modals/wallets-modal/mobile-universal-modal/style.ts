import { styled } from 'solid-styled-components';
import { Button, H1, H2, Image } from 'src/app/components';
import { mediaNotTouch, mediaTouch } from 'src/app/styles/media';

export const UlStyled = styled.ul`
    display: flex;
    margin: 0 auto;
    width: fit-content;
    min-height: 124px;
    max-width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 0 13px 24px;

    &&::-webkit-scrollbar {
        display: none;
    }

    -ms-overflow-style: none;
    scrollbar-width: none;
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
    top: 30px;

    background-color: ${props => props.theme!.colors.icon.tertiary};
`;

export const IconContainer = styled.div`
    width: 64px;
    height: 64px;
    border-radius: 16px;
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

export const H2Styled = styled(H2)`
    margin-bottom: 24px;
    padding: 0 24px;
    min-height: 44px;
`;

export const ButtonStyled = styled(Button)`
    display: block;
    margin: 0 auto;
`;

export const TelegramButtonStyled = styled(Button)`
    margin: 0 24px 24px;
    width: calc(100% - 48px);
    border-radius: 16px;
    padding: 14px 16px 14px 14px;
    background-color: ${props => props.theme!.colors.telegramButton};

    color: ${props => props.theme!.colors.constant.white};
    font-weight: 590;
    font-size: 16px;
    line-height: 20px;
`;

export const TGImageStyled = styled(Image)`
    border-radius: 6px;
    width: 24px;
    height: 24px;
`;
