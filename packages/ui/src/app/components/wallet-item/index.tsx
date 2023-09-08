import { Component, JSXElement } from 'solid-js';
import { BadgeStyled, ImageStyled, StyledSecondLine, StyledText, WalletItemStyled } from './style';
import { Styleable } from 'src/app/models/styleable';

export interface WalletItemProps extends Styleable {
    icon: string | JSXElement;
    name: string;
    secondLine?: string;
    secondLineColorPrimary?: boolean;
    badgeUrl?: string;
    onClick: () => void;
}

export const WalletItem: Component<WalletItemProps> = props => {
    return (
        <WalletItemStyled
            class={props.class}
            onClick={() => props.onClick()}
            data-tc-wallet-item="true"
        >
            {typeof props.icon === 'string' ? <ImageStyled src={props.icon} /> : props.icon}
            {props.badgeUrl && <BadgeStyled src={props.badgeUrl} />}
            <StyledText>{props.name}</StyledText>
            {props.secondLine && (
                <StyledSecondLine colorPrimary={props.secondLineColorPrimary ?? true}>
                    {props.secondLine}
                </StyledSecondLine>
            )}
        </WalletItemStyled>
    );
};
