import { Component, createSignal, onCleanup, onMount, Show } from 'solid-js';
import { Styleable } from 'src/app/models/styleable';
import { getWindow } from 'src/app/utils/web-api';
import diamondStill from './diamond.webp';
import { getIsDiamond3dDegraded } from './performance';
import { attachDiamond, getIsDiamondDrawn, STILL_FADE_DURATION } from './renderer';
import { DiamondCoverStyled, DiamondSlotStyled, DiamondStillStyled, DiamondStyled } from './style';

export interface DiamondProps extends Styleable {
    size: number;
    /** How much the diamond swells while it is pressed; under the mouse it swells half as much. */
    pressScale?: number;
}

const DEFAULT_PRESS_SCALE = 1.7;

/**
 * The blue diamond of the Telegram apps: a 3D model that turns, spins when tapped and can be dragged,
 * or its still image where the model cannot run smoothly or motion is reduced.
 */
export const Diamond: Component<DiamondProps> = props => {
    const [is3d, setIs3d] = createSignal(canAnimate());
    // Only the first diamond on the page waits for the model; the ones after it show the model at once
    const [cover, setCover] = createSignal<'shown' | 'fading' | 'gone'>(
        getIsDiamondDrawn() ? 'gone' : 'shown'
    );
    let slot: HTMLDivElement | undefined;
    let coverImage: HTMLImageElement | undefined;

    onMount(() => {
        if (!is3d() || !slot) {
            return;
        }

        let coverTimeout: ReturnType<typeof setTimeout> | undefined;

        const layout = { size: props.size, pressScale: props.pressScale ?? DEFAULT_PRESS_SCALE };

        attachDiamond(slot, layout, {
            onFirstFrame: () => {
                setCover('fading');
                coverTimeout = setTimeout(() => setCover('gone'), STILL_FADE_DURATION * 1000);
            },
            onError: () => setIs3d(false),
            // Left without the model, as on a screen fading out, it shows the still in its place.
            // By then the screen's reactive parts may be disposed, so the still is shown directly.
            onDetach: () => {
                clearTimeout(coverTimeout);
                if (coverImage) {
                    Object.assign(coverImage.style, {
                        transition: 'none',
                        opacity: '1',
                        visibility: 'visible'
                    });
                }
            }
        });

        onCleanup(() => clearTimeout(coverTimeout));
    });

    return (
        <DiamondStyled
            class={props.class}
            style={{ width: `${props.size}px`, height: `${props.size}px` }}
        >
            <Show
                when={is3d()}
                fallback={<DiamondStillStyled src={diamondStill} alt="" draggable={false} />}
            >
                <DiamondSlotStyled ref={slot} />
                {/* The model is opaque under it, so the diamond never dims while it fades */}
                <DiamondCoverStyled
                    ref={coverImage}
                    src={diamondStill}
                    alt=""
                    draggable={false}
                    style={{
                        opacity: cover() === 'shown' ? 1 : 0,
                        visibility: cover() === 'gone' ? 'hidden' : 'visible',
                        transition: `opacity ${STILL_FADE_DURATION}s linear`
                    }}
                />
            </Show>
        </DiamondStyled>
    );
};

function canAnimate(): boolean {
    const window = getWindow();
    const prefersReducedMotion = !!window?.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    return !getIsDiamond3dDegraded() && !prefersReducedMotion;
}
