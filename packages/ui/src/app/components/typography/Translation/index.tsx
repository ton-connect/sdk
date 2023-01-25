import { useI18n } from '@solid-primitives/i18n';
import { Component, JSXElement } from 'solid-js';
import { Translateable } from 'src/app/models/translateable';
import { PropertyRequired } from 'src/app/utils/types';

interface TranslationProps extends PropertyRequired<Translateable, 'translationKey'> {
    children?: JSXElement;
}

export const Translation: Component<TranslationProps> = props => {
    const [t] = useI18n();

    return <>{t(props.translationKey, props.translationValues, props.children?.toString())}</>;
};
