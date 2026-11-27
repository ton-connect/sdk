import { Component, createSignal, JSXElement, onCleanup } from 'solid-js';
import { Styleable } from 'src/app/models/styleable';
import { ScrollContainerStyled } from './style';
import windowHeight from 'src/app/hooks/windowSize';
import { isMobile } from 'src/app/hooks/isMobile';

export interface ScrollContainerProps extends Styleable {
    children: JSXElement;
    maxHeight?: number;
}

export const ScrollContainer: Component<ScrollContainerProps> = props => {
    const [fadeTop, setFadeTop] = createSignal(false);
    const [fadeBottom, setFadeBottom] = createSignal(false);

    // An edge fades only while there is more to scroll past it.
    const updateEdges = (el: HTMLElement): void => {
        setFadeTop(el.scrollTop > 0);
        setFadeBottom(el.scrollTop + el.clientHeight < el.scrollHeight - 1);
    };

    const watchEdges = (el: HTMLDivElement): void => {
        requestAnimationFrame(() => updateEdges(el));
        if (typeof ResizeObserver !== 'undefined') {
            const observer = new ResizeObserver(() => updateEdges(el));
            observer.observe(el);
            onCleanup(() => observer.disconnect());
        }
    };

    const offset = (): number => (isMobile() ? 150 : 200);

    const maxHeight = (): string =>
        props.maxHeight !== undefined ? `${props.maxHeight}px` : `${windowHeight() - offset()}px`;

    return (
        <ScrollContainerStyled
            ref={watchEdges}
            maxHeight={maxHeight()}
            fadeTop={fadeTop()}
            fadeBottom={fadeBottom()}
            onScroll={e => updateEdges(e.currentTarget)}
            class={props.class}
        >
            {props.children}
        </ScrollContainerStyled>
    );
};
