import { Component, createSignal, onCleanup, onMount, Show } from 'solid-js';
import { Styleable } from 'src/app/models/styleable';
import { getWindow } from 'src/app/utils/web-api';
import diamondStill from './diamond.webp';
import { getIsDiamond3dDegraded } from './performance';
import { attachDiamond, getIsDiamondDrawn, STILL_FADE_DURATION } from './renderer';
import { DiamondCoverStyled, DiamondSlotStyled, DiamondStillStyled, DiamondStyled } from './style';

export interface DiamondProps extends Styleable {
    size: number;
    /** How much the diamond grows under the pointer or a finger. */
    hoverScale?: number;
}

const DEFAULT_HOVER_SCALE = 1.7;

/**
 * The blue diamond of the Telegram apps: a 3D model that turns and can be dragged, or its still image
 * where the model cannot run smoothly or motion is reduced.
 */
export const Diamond: Component<DiamondProps> = props => {
    const [is3d, setIs3d] = createSignal(canAnimate());
    // Only the first diamond on the page waits for the model; the ones after it show the model at once
    const [cover, setCover] = createSignal<'shown' | 'fading' | 'gone'>(
        getIsDiamondDrawn() ? 'gone' : 'shown'
    );
    let slot: HTMLDivElement | undefined;

    onMount(() => {
        if (!is3d() || !slot) {
            return;
        }

        let coverTimeout: ReturnType<typeof setTimeout> | undefined;

        const layout = { size: props.size, hoverScale: props.hoverScale ?? DEFAULT_HOVER_SCALE };

        attachDiamond(slot, layout, {
            onFirstFrame: () => {
                setCover('fading');
                coverTimeout = setTimeout(() => setCover('gone'), STILL_FADE_DURATION * 1000);
            },
            onError: () => setIs3d(false)
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
                <Show when={cover() !== 'gone'}>
                    <DiamondCoverStyled
                        src={diamondStill}
                        alt=""
                        draggable={false}
                        style={{
                            opacity: cover() === 'fading' ? 0 : 1,
                            transition: `opacity ${STILL_FADE_DURATION}s linear`
                        }}
                    />
                </Show>
            </Show>
        </DiamondStyled>
    );
};

function canAnimate(): boolean {
    const window = getWindow();
    const prefersReducedMotion = !!window?.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    return !getIsDiamond3dDegraded() && !prefersReducedMotion;
}
