import { Component } from 'solid-js';
import { ImageStyled, StyledText, WalletItemStyled } from './style';
import { Styleable } from 'src/app/models/styleable';

export interface WalletItemProps extends Styleable {
    iconUrl: string;
    name: string;
    onClick: () => void;
}

export const WalletItem: Component<WalletItemProps> = props => {
    return (
        <WalletItemStyled class={props.class} onClick={() => props.onClick()} data-tc-wallet-item="true">
            <ImageStyled src={props.iconUrl} alt="" />
            <StyledText>{props.name}</StyledText>
        </WalletItemStyled>
    );
};
