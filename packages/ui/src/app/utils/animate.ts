import { logWarning } from 'src/app/utils/log';

/**
 * A mock animation timeline class for environments that do not support animations.
 */
class AnimationTimelineNoop implements AnimationTimeline {
    public readonly currentTime: number = 0;
}

/**
 * A mock animation class for environments that do not support animations.
 */
class AnimationNoop implements Animation {
    private static _instance: AnimationNoop | null = null;

    public static create(): Animation {
        if (!AnimationNoop._instance) {
            logWarning(
                'Animation is not supported in this environment: please consider using the `web-animations-js` polyfill to provide a fallback implementation of the Web Animations API.'
            );
            AnimationNoop._instance = new AnimationNoop();
        }
        return AnimationNoop._instance;
    }

    public readonly currentTime: number = 0;

    public readonly playbackRate: number = 1;

    public readonly startTime: number | null = null;

    public readonly timeline: AnimationTimeline = new AnimationTimelineNoop();

    public readonly finished: Promise<Animation> = Promise.resolve(this);

    public readonly effect: AnimationEffect | null = null;

    public readonly id: string = '';

    public readonly pending: boolean = false;

    public readonly playState: AnimationPlayState = 'finished';

    public readonly replaceState: AnimationReplaceState = 'active';

    public readonly ready: Promise<Animation> = Promise.resolve(this);

    public readonly oncancel: ((this: Animation, event: AnimationPlaybackEvent) => unknown) | null =
        null;

    public readonly onfinish: ((this: Animation, event: AnimationPlaybackEvent) => unknown) | null =
        null;

    public readonly onremove: ((this: Animation, ev: Event) => unknown) | null = null;

    private constructor() {}

    public cancel(): void {
        // no-op
    }

    public finish(): void {
        // no-op
    }

    public pause(): void {
        // no-op
    }

    public play(): void {
        // no-op
    }

    public reverse(): void {
        // no-op
    }

    public addEventListener(
        _type: string,
        _listener: EventListenerOrEventListenerObject | null,
        _options?: boolean | AddEventListenerOptions
    ): void {
        // no-op
    }

    public dispatchEvent(_event: Event): boolean {
        return false;
    }

    public removeEventListener(
        _type: string,
        _callback: EventListenerOrEventListenerObject | null,
        _options?: EventListenerOptions | boolean
    ): void {
        // no-op
    }

    public updatePlaybackRate(_playbackRate: number): void {
        // no-op
    }

    public commitStyles(): void {
        // no-op
    }

    public persist(): void {
        // no-op
    }
}

/**
 * A function that performs an animation on an element using Web Animations API.
 * If the environment supports animations, it uses the native animate function.
 * If not, it returns an instance of AnimationNoop to prevent code from breaking.
 *
 * @param element - The element to animate.
 * @param keyframes - The keyframes that define the animation.
 * @param options - The options that control the animation.
 * @returns An instance of Animation.
 */
export function animate(
    element: Element,
    keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
    options?: number | KeyframeAnimationOptions
): Animation {
    if ('animate' in element) {
        return element.animate(keyframes, options);
    }
    return AnimationNoop.create();
}
