import { Component, createEffect, createSignal, onCleanup, onMount, Show } from 'solid-js';
import { ImagePlaceholder } from './style';
import { Styleable } from 'src/app/models/styleable';

export interface ImageProps extends Styleable {
    src: string;
    alt?: string;
}

export const Image: Component<ImageProps> = props => {
    let imgRef: HTMLImageElement | undefined;

    const [image, setImage] = createSignal<HTMLImageElement | null>(null);
    const [shouldLoad, setShouldLoad] = createSignal(false);

    onMount(() => {
        // Lazily load the image only when its placeholder is about to become visible,
        // instead of downloading every image eagerly on mount.
        if (typeof IntersectionObserver === 'undefined' || !imgRef) {
            setShouldLoad(true);
            return;
        }

        const observer = new IntersectionObserver(
            entries => {
                if (entries.some(entry => entry.isIntersecting)) {
                    observer.disconnect();
                    setShouldLoad(true);
                }
            },
            { rootMargin: '150px' }
        );

        observer.observe(imgRef);
        onCleanup(() => observer.disconnect());
    });

    createEffect(() => {
        if (!shouldLoad()) {
            return;
        }

        const img = new window.Image();
        img.src = props.src;
        img.alt = props.alt || '';
        img.setAttribute('draggable', 'false');
        if (props.class) {
            img.classList.add(props.class);
        }

        if (img.complete) {
            setImage(img);
            return;
        }

        const onLoad = (): void => {
            setImage(img);
        };
        img.addEventListener('load', onLoad);

        onCleanup(() => img.removeEventListener('load', onLoad));
    });

    return (
        <>
            <Show when={image()}>{image()}</Show>
            <Show when={!image()}>
                <ImagePlaceholder class={props.class} ref={imgRef} />
            </Show>
        </>
    );
};
