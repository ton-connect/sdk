import { Component, createEffect, JSXElement, onMount } from 'solid-js';
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
    let ctxRef: HTMLDivElement | null = null;

    // adjust letter spacing to fit the wallet name in the item
    const adjustLetterSpacing = (): void => {
        // we can't set `ref` on the `StyledText` directly, so we use a context ref
        const name = ctxRef?.querySelector('div');
        if (name && name.scrollWidth > name.clientWidth) {
            let spacing = 0;
            const minSpacing = -0.4;
            const step = 0.05;
            // reduce letter spacing until the text fits
            while (name.scrollWidth > name.clientWidth && spacing >= minSpacing) {
                spacing -= step;
                name.style.letterSpacing = `${spacing}px`;
            }
            // adjust spacing one more time to make sure the text fits
            if (spacing !== 0) {
                spacing -= step;
                name.style.letterSpacing = `${spacing}px`;
            }
        }
    };

    onMount(() => adjustLetterSpacing());

    createEffect(() => {
        adjustLetterSpacing();
    });

    return (
        <WalletItemStyled
            class={props.class}
            onClick={() => props.onClick()}
            data-tc-wallet-item="true"
        >
            {typeof props.icon === 'string' ? (
                <ImageStyled
                    src={props.icon}
                    badge={props.badgeUrl && <BadgeStyled src={props.badgeUrl} />}
                />
            ) : (
                props.icon
            )}
            <div ref={el => (ctxRef = el)}>
                <StyledText>{props.name}</StyledText>
            </div>
            {props.secondLine && (
                <StyledSecondLine colorPrimary={props.secondLineColorPrimary ?? true}>
                    {props.secondLine}
                </StyledSecondLine>
            )}
        </WalletItemStyled>
    );
};
