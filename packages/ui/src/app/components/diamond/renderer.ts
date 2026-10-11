import { lerp } from './math';
import {
    createFrameWatchdog,
    getIsDiamond3dDegraded,
    markDiamond3dDegraded,
    onDiamond3dDegraded
} from './performance';
import {
    createDiamondScene,
    DiamondDrawState,
    DiamondScene,
    getFrameTime,
    TURN_DURATION
} from './scene';
import { diamondCanvasClass } from './style';

type Animation = {
    startTime: number;
    duration: number;
    onUpdate: (progress: number) => void;
    onEnd?: () => void;
};

export type DiamondLayout = {
    size: number;
    hoverScale: number;
};

export type DiamondCallbacks = {
    onFirstFrame: () => void;
    onError: () => void;
};

type Renderer = {
    hasDrawn: () => boolean;
    attach: (container: HTMLElement, layout: DiamondLayout, callbacks: DiamondCallbacks) => void;
};

/**
 * Seconds the still takes to fade out over the first frame. The diamond stays put under it until then,
 * so the two match.
 */
export const STILL_FADE_DURATION = 0.2;

// Longer than a frame on 120 Hz screens and shorter than a frame on 100 Hz screens
const MIN_FRAME_INTERVAL = 9.5;

const RELEASE_DURATION = 0.6;
const TAP_DURATION = 0.22;

const FULL_TURN = 360;
// Degrees per second of the scene clock
const IDLE_SPEED = FULL_TURN / TURN_DURATION;
// Each time the diamond is shown the opening gives it a kick: a short push speeds it up to this many
// times its usual speed, and friction then slows it back down
const SPIN_KICK = 22;
// Seconds for the push and the friction each to fade to about a third
const SPIN_KICK_PUSH = 0.12;
const SPIN_KICK_FRICTION = 0.65;
// When the push is spent and the speed peaks, about the moment the modal settles
const SPIN_KICK_PEAK_TIME =
    ((SPIN_KICK_PUSH * SPIN_KICK_FRICTION) / (SPIN_KICK_FRICTION - SPIN_KICK_PUSH)) *
    Math.log(SPIN_KICK_FRICTION / SPIN_KICK_PUSH);
const SPIN_KICK_PEAK = getKickShape(SPIN_KICK_PEAK_TIME);
const OVERSHOOT_TENSION = 2;
const TAP_MAX_YAW = 10;
const TAP_MIN_ANGLE = 40;
const TAP_ANGLE_SPREAD = 30;
const TOUCH_SLOP = 8;
// Under the pointer or a finger the diamond grows; the transition in `style.ts` takes this long
const HOVER_TRANSITION_DURATION = 200;
// Device pixels, so the diamond turns as fast as in the Android app on a screen of the same density
const DRAG_YAW_SPEED = 0.5;
const DRAG_PITCH_SPEED = 0.05;

// One canvas for the page: the next diamond takes it over as it is, so a modal opened again shows the
// diamond at once, and a closing modal keeps it until it leaves the page
let renderer: Renderer | undefined;

/**
 * Puts the 3D diamond into `container`. `onFirstFrame` is called once the model has drawn for the first
 * time, and `onError` once the diamond cannot be shown. It stops drawing while it is off the page or in
 * a hidden tab.
 */
export function attachDiamond(
    container: HTMLElement,
    layout: DiamondLayout,
    callbacks: DiamondCallbacks
): void {
    if (getIsDiamond3dDegraded()) {
        callbacks.onError();
        return;
    }

    renderer ??= createRenderer();

    if (!renderer) {
        callbacks.onError();
        return;
    }

    renderer.attach(container, layout, callbacks);
}

/** Whether a diamond put on the page now shows the model at once, with no still in its place. */
export function getIsDiamondDrawn(): boolean {
    return !!renderer?.hasDrawn();
}

function createRenderer(): Renderer | undefined {
    const canvas = document.createElement('canvas');

    // Without a usable GPU the browser renders WebGL on the CPU, far too slow for these shaders
    const gl = canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: true });

    if (!gl) {
        markDiamond3dDegraded('no GPU for WebGL 2');
        return undefined;
    }

    canvas.className = diamondCanvasClass;

    const pixelRatio = window.devicePixelRatio || 1;
    const watchdog = createFrameWatchdog();
    const drawState: DiamondDrawState = {};

    let scene: DiamondScene | undefined;
    let callbacks: DiamondCallbacks | undefined;
    let hoverScale = 1;
    let frameId: number | undefined;
    let lastFrameTime: number | undefined;
    let time = 0;
    let hasDrawn = false;

    // Degrees
    let yaw = 0;
    let pitch = 0;
    let animation: Animation | undefined;
    // Unset until the diamond may start turning
    let spinStart: number | undefined;
    let isPressed = false;
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let lastY = 0;
    let cssSize = 0;
    // The drawing buffer grows with the diamond, so it stays sharp
    let resolutionScale = 1;
    let shrinkTimeout: ReturnType<typeof setTimeout> | undefined;

    function render(now: number): void {
        if (!canvas.isConnected) {
            frameId = undefined;
            return;
        }

        frameId = requestAnimationFrame(render);
        watchdog.track(now);

        // Android draws at most 60 times per second; skipping every other frame on 120 Hz halves the GPU work
        if (lastFrameTime !== undefined && now - lastFrameTime < MIN_FRAME_INTERVAL) {
            return;
        }

        const frameTime = getFrameTime(now, lastFrameTime);
        lastFrameTime = now;
        time += frameTime;

        updateAnimation(frameTime);

        // Resizing clears the canvas, so it happens right before a draw
        const bufferSize = Math.round(cssSize * pixelRatio * resolutionScale);
        if (canvas.width !== bufferSize) {
            canvas.width = bufferSize;
            canvas.height = bufferSize;
        }

        scene!.draw(
            drawState,
            { x: 0, y: 0, size: canvas.width },
            time,
            frameTime,
            convertToRadians(yaw),
            convertToRadians(pitch)
        );

        if (!hasDrawn) {
            hasDrawn = true;
            spinStart = time + STILL_FADE_DURATION;
            callbacks?.onFirstFrame();
        }
    }

    // Between gestures the diamond turns on its own
    function updateAnimation(frameTime: number): void {
        if (!animation) {
            if (!isPressed) {
                yaw = (yaw + IDLE_SPEED * getSpinBoost() * frameTime) % FULL_TURN;
            }

            return;
        }

        const current = animation;
        const progress = Math.max(0, time - current.startTime) / current.duration;

        current.onUpdate(Math.min(progress, 1));

        if (progress >= 1) {
            animation = undefined;
            current.onEnd?.();
        }
    }

    function getSpinBoost(): number {
        if (spinStart === undefined || time < spinStart) {
            return 0;
        }

        return 1 + ((SPIN_KICK - 1) * getKickShape(time - spinStart)) / SPIN_KICK_PEAK;
    }

    function release(): void {
        const fromYaw = yaw;
        const fromPitch = pitch;

        animation = {
            startTime: time,
            duration: RELEASE_DURATION,
            onUpdate: progress => {
                const ratio = 1 - easeOvershoot(progress);
                yaw = fromYaw * ratio;
                pitch = fromPitch * ratio;
            }
        };
    }

    function tiltTowards(x: number, y: number): void {
        if (Math.abs(yaw) > TAP_MAX_YAW) {
            return;
        }

        const halfSize = Math.max(1, canvas.clientWidth / 2);
        const fromYaw = yaw;
        const fromPitch = pitch;
        const toYaw = ((halfSize - x) * getTapAngle()) / halfSize;
        const toPitch = ((halfSize - y) * getTapAngle()) / halfSize;

        animation = {
            startTime: time,
            duration: TAP_DURATION,
            onUpdate: progress => {
                const ratio = easeOutQuint(progress);
                yaw = lerp(fromYaw, toYaw, ratio);
                pitch = lerp(fromPitch, toPitch, ratio);
            },
            onEnd: release
        };
    }

    function handlePointerDown(e: PointerEvent): void {
        if (e.button !== 0) {
            return;
        }

        isPressed = true;
        isDragging = false;
        animation = undefined;
        startX = lastX = e.offsetX;
        startY = lastY = e.offsetY;
        canvas.setPointerCapture(e.pointerId);
    }

    function handlePointerMove(e: PointerEvent): void {
        if (!isPressed) {
            return;
        }

        // On macOS, Ctrl+click opens a context menu that takes the button release, so `pointerup` never arrives
        if (!e.buttons) {
            handlePointerUp(e);
            return;
        }

        if (!isDragging) {
            if (Math.hypot(e.offsetX - startX, e.offsetY - startY) <= TOUCH_SLOP) {
                return;
            }

            isDragging = true;
        }

        yaw += (e.offsetX - lastX) * pixelRatio * DRAG_YAW_SPEED;
        pitch += (e.offsetY - lastY) * pixelRatio * DRAG_PITCH_SPEED;
        lastX = e.offsetX;
        lastY = e.offsetY;
    }

    function handlePointerUp(e: PointerEvent): void {
        if (!isPressed) {
            return;
        }

        isPressed = false;
        release();

        if (!isDragging && e.type === 'pointerup') {
            tiltTowards(e.offsetX, e.offsetY);
        }
    }

    function grow(): void {
        clearTimeout(shrinkTimeout);
        resolutionScale = hoverScale;
        canvas.style.transform = `scale(${hoverScale})`;
    }

    // The buffer stays large until the diamond has shrunk back
    function shrink(): void {
        canvas.style.transform = '';
        shrinkTimeout = setTimeout(() => {
            resolutionScale = 1;
        }, HOVER_TRANSITION_DURATION);
    }

    // A hidden tab gets no frames anyway; stopping keeps the scene clock from counting the time away
    function updatePlayback(): void {
        if (scene && canvas.isConnected && !document.hidden) {
            resume();
        } else {
            pause();
        }
    }

    function resume(): void {
        if (frameId !== undefined) {
            return;
        }

        lastFrameTime = undefined;
        watchdog.reset();
        frameId = requestAnimationFrame(render);
    }

    function pause(): void {
        if (frameId === undefined) {
            return;
        }

        cancelAnimationFrame(frameId);
        frameId = undefined;
    }

    // A lost context or a failed model load is retried by the next diamond; slowness is not
    function fail(): void {
        renderer = undefined;
        pause();
        unsubscribeFromDegradation();
        document.removeEventListener('visibilitychange', updatePlayback);
        canvas.removeEventListener('webglcontextlost', fail);
        canvas.remove();
        gl!.getExtension('WEBGL_lose_context')?.loseContext();
        callbacks?.onError();
    }

    const unsubscribeFromDegradation = onDiamond3dDegraded(fail);

    document.addEventListener('visibilitychange', updatePlayback);
    canvas.addEventListener('webglcontextlost', fail);
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);
    // Otherwise iOS starts selecting the text around when the diamond is pressed and dragged
    canvas.addEventListener('touchstart', preventDefault, { passive: false });
    canvas.addEventListener('pointerenter', grow);
    canvas.addEventListener('pointerleave', shrink);

    createDiamondScene(gl)
        .then(createdScene => {
            scene = createdScene;
            updatePlayback();
        })
        .catch(fail);

    return {
        hasDrawn: () => hasDrawn,
        attach(container, { size, hoverScale: attachHoverScale }, attachCallbacks) {
            callbacks = attachCallbacks;
            hoverScale = attachHoverScale;
            // Before the first frame the kick waits for the still to fade out
            spinStart = hasDrawn ? time : undefined;
            // A modal closed under the pointer took the grown diamond with it
            clearTimeout(shrinkTimeout);
            canvas.style.transform = '';
            resolutionScale = 1;

            cssSize = size;
            canvas.style.width = `${size}px`;
            canvas.style.height = `${size}px`;
            container.appendChild(canvas);
            updatePlayback();
        }
    };
}

// A wheel given a soft shove: its extra speed rises while the push lasts, then glides back to nothing
// under friction, with no visible start or end
function getKickShape(elapsed: number): number {
    return Math.exp(-elapsed / SPIN_KICK_FRICTION) - Math.exp(-elapsed / SPIN_KICK_PUSH);
}

function preventDefault(e: Event): void {
    e.preventDefault();
}

function getTapAngle(): number {
    return Math.random() * TAP_ANGLE_SPREAD + TAP_MIN_ANGLE;
}

function easeOutQuint(t: number): number {
    return 1 + (t - 1) ** 5;
}

function easeOvershoot(t: number): number {
    const shifted = t - 1;

    return shifted * shifted * ((OVERSHOOT_TENSION + 1) * shifted + OVERSHOOT_TENSION) + 1;
}

function convertToRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
}
