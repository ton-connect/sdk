import type { Property } from 'csstype';
import { Component, JSXElement, Match, Show, Switch } from 'solid-js';
import { ArrowIcon } from 'src/app/components/icons/arrow-icon';
import { CloseIcon } from 'src/app/components/icons/close-icon';
import { Styleable } from 'src/app/models/styleable';
import { IconButtonStyled } from './style';
import { WithDataAttributes } from 'src/app/models/with-data-attributes';
import { useDataAttributes } from 'src/app/hooks/use-data-attributes';
import { useI18n } from '@solid-primitives/i18n';
import { useTheme } from 'solid-styled-components';

export interface IconButtonProps extends Styleable, WithDataAttributes {
    fill?: Property.Color;
    children?: JSXElement;
    icon?: 'close' | 'arrow' | JSXElement;
    /** What the button does, for screen readers; close and back buttons are labelled already. */
    label?: string;
    onClick: () => void;
}

export const IconButton: Component<IconButtonProps> = props => {
    const dataAttrs = useDataAttributes(props);
    const [t] = useI18n();
    const theme = useTheme();
    // Icons take the text colour, black or white, so they read as clearly as the titles beside them
    const fill = (): Property.Color => props.fill ?? theme.colors.text.primary;
    const icon = (): 'close' | 'arrow' | JSXElement => props.icon || 'close';
    const label = (): string | undefined => {
        if (props.label) {
            return props.label;
        }
        if (icon() === 'close') {
            return t('common.close', {}, 'Close');
        }
        if (icon() === 'arrow') {
            return t('common.back', {}, 'Back');
        }
        return undefined;
    };
    return (
        <IconButtonStyled
            class={props.class}
            type="button"
            aria-label={label()}
            onClick={() => props.onClick()}
            data-tc-icon-button="true"
            {...dataAttrs}
        >
            <Show when={!!props.children}>{props.children}</Show>
            <Show when={!props.children}>
                <Switch>
                    <Match when={icon() === 'close'}>
                        <CloseIcon fill={fill()} />
                    </Match>
                    <Match when={icon() === 'arrow'}>
                        <ArrowIcon fill={fill()} />
                    </Match>
                    <Match when={typeof icon() !== 'string'}>{icon()}</Match>
                </Switch>
            </Show>
        </IconButtonStyled>
    );
};
