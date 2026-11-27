import { Component, JSXElement } from 'solid-js';
import { BadgeStyled, ImageStyled, StyledSecondLine, StyledText, WalletItemStyled } from './style';
import { Styleable } from 'src/app/models/styleable';
import { stripWalletNameNote } from 'src/app/utils/wallets';

export interface WalletItemProps extends Styleable {
    icon: string | JSXElement;
    name: string;
    secondLine?: string;
    secondLineColorPrimary?: boolean;
    badgeUrl?: string;
    /** A soft glow behind the icon on the phone sheet (Gram Wallet). */
    glow?: boolean;
    /** A shine passing over the icon twice, then stopping (Gram Wallet and Telegram). */
    shine?: boolean;
    /** The icon is drawn as a circle (Telegram). */
    round?: boolean;
    onClick: () => void;
}

export const WalletItem: Component<WalletItemProps> = props => {
    const name = (): string => stripWalletNameNote(props.name);

    return (
        <WalletItemStyled
            class={props.class}
            onClick={() => props.onClick()}
            data-tc-wallet-item="true"
        >
            {typeof props.icon === 'string' ? (
                <ImageStyled
                    src={props.icon}
                    glow={!!props.glow}
                    shine={!!props.shine}
                    round={!!props.round}
                    badge={props.badgeUrl && <BadgeStyled src={props.badgeUrl} />}
                />
            ) : (
                props.icon
            )}
            <StyledText>{name()}</StyledText>
            {props.secondLine && (
                <StyledSecondLine colorPrimary={props.secondLineColorPrimary ?? true}>
                    {props.secondLine}
                </StyledSecondLine>
            )}
        </WalletItemStyled>
    );
};
