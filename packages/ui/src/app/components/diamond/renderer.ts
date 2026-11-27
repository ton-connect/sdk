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
    // Degrees per second at a point of the animation, so a turn cut short hands its speed on
    getVelocity?: (progress: number) => number;
    onUpdate: (progress: number) => void;
    onEnd?: () => void;
};

export type DiamondLayout = {
    size: number;
    /** How much the diamond grows while it is pressed. */
    pressScale: number;
};

export type DiamondCallbacks = {
    onFirstFrame: () => void;
    onError: () => void;
    /** Another diamond took the canvas, as when a screen fades out while the next one comes in. */
    onDetach?: () => void;
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

// The motion follows the diamond of the Gram Wallet apps: it turns slowly on its own and twice as fast
// under the mouse, and turns three times when tapped. It can be turned every way with a finger: round
// and round, and up and down with growing resistance; let go, it keeps the turn, carries on with the
// drag's speed or spins away after a flick, and tips back level. It swells while pressed, and half as
// much under the mouse. Each time it is shown, the opening gives it a spin first.

// Longer than a frame on 120 Hz screens and shorter than a frame on 100 Hz screens
const MIN_FRAME_INTERVAL = 9.5;

// Durations are in seconds of the scene clock, which stops while nothing is drawn, so the diamond
// goes on from the same angle instead of jumping ahead
const TAP_TURN_DURATION = 1.8;
const TAP_TURNS = 3;
const MAX_TAP_DURATION_MS = 250;
const HOVER_SPEED = 2;
// Under the mouse it swells this share of the way to its pressed size
const HOVER_GROW_SHARE = 0.5;
const HOVER_SMOOTHING_RATE = 10;
const GROW_SPRING_STEP = 1 / 120;
const GROW_SPRING_STIFFNESS = 196;
const GROW_SPRING_DAMPING_RATIO = 0.42;
const GROW_SPRING_FREQUENCY = 14;
const GROW_SPRING_THRESHOLD = 0.0001;

const FULL_TURN = 360;
// Degrees per second of its own turning
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
const TOUCH_SLOP = 8;

// Dragging, as in the phone apps (angles in degrees, distances in CSS pixels, times in seconds)
// A drag across this distance turns the diamond half way round
const DRAG_HALF_TURN_DISTANCE = 220;
const DRAG_SPEED = FULL_TURN / 2 / DRAG_HALF_TURN_DISTANCE;
// It tilts up and down with growing resistance, never quite this far
const PITCH_LIMIT = 63;
// The angles follow the finger through a spring, so the diamond moves with a little weight
const FOLLOW_SPRING_STIFFNESS = (3 * 2 * Math.PI) ** 2;
const FOLLOW_SPRING_DAMPING = 2 * 0.8 * 3 * 2 * Math.PI;
const MOTION_STEP = 1 / 120;
// Let go while moving, it carries on at the drag's speed and slows down
const MAX_DRAG_VELOCITY = 286;
const DRAG_MOMENTUM_WINDOW = 0.12;
const DRAG_MOMENTUM_DECAY_RATE = 4.2;
// A flick faster than this sets it spinning, two turns or so before it slows to its own pace
const FLING_MIN_SPEED = 600;
const FLING_SAMPLE_WINDOW = 0.08;
const FLING_SPEED = 1117;
const FLING_DECAY = 0.7;
const MIN_SPIN_VELOCITY = 0.1;
// After a drag its own turning comes back gradually
const IDLE_RESUME_DURATION = 0.75;

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
    let pressScale = 1;
    let frameId: number | undefined;
    let lastFrameTime: number | undefined;
    let time = 0;
    let hasDrawn = false;
    let cssSize = 0;

    // Degrees; the angles drawn follow the target ones through a spring
    let yaw = 0;
    let pitch = 0;
    let targetYaw = 0;
    let targetPitch = 0;
    // The pitch the drag asks for, before the resistance near the limit
    let rawPitch = 0;
    let yawSpringVelocity = 0;
    let pitchSpringVelocity = 0;
    // Degrees per second the drag was moving at, and of a flick's spin
    let yawVelocity = 0;
    let spinVelocity = 0;
    let timeSinceRelease = IDLE_RESUME_DURATION;
    let lastDragAt = 0;
    let dragSamples: { x: number; at: number }[] = [];
    // A tap's turns; the rest of the motion runs on the springs
    let animation: Animation | undefined;
    let interruptedTurnVelocity: number | undefined;
    // Unset until the diamond may start turning on its own
    let idleStart: number | undefined;
    // When the opening's spin started; unset before the first frame
    let kickStart: number | undefined;
    let isPressed = false;
    let pressStartedAt = 0;
    let activePointerId: number | undefined;
    let isDragging = false;
    let isHovered = false;
    let idleSpeed = 1;
    let grow = 1;
    let growVelocity = 0;
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let lastY = 0;

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

        if (idleStart !== undefined && time >= idleStart) {
            idleStart = undefined;
        }

        idleSpeed = lerp(
            idleSpeed,
            isHovered ? HOVER_SPEED : 1,
            1 - Math.exp(-frameTime * HOVER_SMOOTHING_RATE)
        );
        if (animation) {
            updateAnimation();
        } else {
            updateMotion(frameTime);
        }
        updateGrow(frameTime);

        // The drawing buffer grows with the diamond, so it stays sharp; resizing clears the canvas, so it
        // happens right before a draw
        const isGrown = isPressed || grow !== 1;
        const bufferSize = Math.round(cssSize * pixelRatio * (isGrown ? pressScale : 1));
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
            // The diamond stays put until the still over it has faded out
            idleStart = time + STILL_FADE_DURATION;
            kickStart = idleStart;
            callbacks?.onFirstFrame();
        }
    }

    function getKickBoost(): number {
        if (kickStart === undefined || time < kickStart) {
            return 1;
        }

        return 1 + ((SPIN_KICK - 1) * getKickShape(time - kickStart)) / SPIN_KICK_PEAK;
    }

    function updateAnimation(): void {
        if (!animation) {
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

    // A damped spring, stepped at a fixed rate so it moves the same on any screen
    function updateGrow(frameTime: number): void {
        const target = isPressed
            ? pressScale
            : isHovered
              ? 1 + (pressScale - 1) * HOVER_GROW_SHARE
              : 1;

        if (grow === target && growVelocity === 0) {
            return;
        }

        let remaining = frameTime;
        while (remaining > 0) {
            const step = Math.min(remaining, GROW_SPRING_STEP);
            growVelocity +=
                ((target - grow) * GROW_SPRING_STIFFNESS -
                    2 * GROW_SPRING_DAMPING_RATIO * GROW_SPRING_FREQUENCY * growVelocity) *
                step;
            grow += growVelocity * step;
            remaining -= step;
        }

        if (
            Math.abs(grow - target) < GROW_SPRING_THRESHOLD &&
            Math.abs(growVelocity) < GROW_SPRING_THRESHOLD
        ) {
            grow = target;
            growVelocity = 0;
        }

        canvas.style.transform = grow === 1 ? '' : `scale(${Math.min(pressScale, grow)})`;
    }

    // Its own turning, a drag's carry and a flick's spin, with the drawn angles following the target
    // ones through springs; stepped at a fixed rate so it moves the same on any screen
    function updateMotion(frameTime: number): void {
        const ownSpeed =
            hasDrawn && idleStart === undefined ? IDLE_SPEED * idleSpeed * getKickBoost() : 0;

        let remaining = frameTime;
        while (remaining > 0) {
            const step = Math.min(remaining, MOTION_STEP);
            remaining -= step;

            if (!isPressed) {
                timeSinceRelease += step;

                const decay = Math.exp(-DRAG_MOMENTUM_DECAY_RATE * step);
                targetYaw += (yawVelocity * (1 - decay)) / DRAG_MOMENTUM_DECAY_RATE;
                yawVelocity *= decay;

                const fade = Math.exp(-step / FLING_DECAY);
                const spin = spinVelocity * FLING_DECAY * (1 - fade);
                spinVelocity =
                    Math.abs(spinVelocity * fade) < MIN_SPIN_VELOCITY ? 0 : spinVelocity * fade;

                const own = ownSpeed * step * Math.min(timeSinceRelease / IDLE_RESUME_DURATION, 1);
                targetYaw += spin + own;
                yaw += spin + own;
                targetPitch = 0;
            }

            yawSpringVelocity +=
                ((targetYaw - yaw) * FOLLOW_SPRING_STIFFNESS -
                    FOLLOW_SPRING_DAMPING * yawSpringVelocity) *
                step;
            pitchSpringVelocity +=
                ((targetPitch - pitch) * FOLLOW_SPRING_STIFFNESS -
                    FOLLOW_SPRING_DAMPING * pitchSpringVelocity) *
                step;
            yaw += yawSpringVelocity * step;
            pitch += pitchSpringVelocity * step;
        }

        // Whole turns are dropped, so the angles stay small however long it turns
        const turns = Math.trunc(yaw / FULL_TURN) * FULL_TURN;
        yaw -= turns;
        targetYaw -= turns;
    }

    // Holds the diamond where it is, so the springs start from rest
    function settle(): void {
        targetYaw = yaw;
        targetPitch = pitch;
        yawSpringVelocity = 0;
        pitchSpringVelocity = 0;
        yawVelocity = 0;
        spinVelocity = 0;
    }

    // Three turns that start at the speed of a turn the tap cut short, so taps in a row keep it spinning
    function turnOnTap(): void {
        const fromYaw = yaw;
        const distance = FULL_TURN * TAP_TURNS;
        const tangent =
            (interruptedTurnVelocity ?? (3 * distance) / TAP_TURN_DURATION) * TAP_TURN_DURATION;
        interruptedTurnVelocity = undefined;
        pitch = 0;

        animation = {
            startTime: time,
            duration: TAP_TURN_DURATION,
            getVelocity: progress =>
                (6 * distance * progress * (1 - progress) +
                    tangent * (3 * progress * progress - 4 * progress + 1)) /
                TAP_TURN_DURATION,
            onUpdate: progress => {
                yaw =
                    fromYaw +
                    distance * progress * progress * (3 - 2 * progress) +
                    tangent * progress * (1 - progress) ** 2;
                pitch = 0;
            },
            // The turns end at rest, and its own turning takes over at full speed
            onEnd: () => {
                settle();
                timeSinceRelease = IDLE_RESUME_DURATION;
            }
        };
    }

    function handlePointerDown(e: PointerEvent): void {
        if (e.button !== 0 || e.isPrimary === false || isPressed) {
            return;
        }

        isPressed = true;
        pressStartedAt = performance.now();
        activePointerId = e.pointerId;
        isDragging = false;
        interruptedTurnVelocity = animation?.getVelocity?.(
            Math.min(1, Math.max(0, time - animation.startTime) / animation.duration)
        );
        animation = undefined;
        // Caught, it stops where it is; a tilt it still has is picked up where the resistance left it
        settle();
        const offset = Math.min(PITCH_LIMIT - 0.01, Math.max(-PITCH_LIMIT + 0.01, pitch));
        rawPitch = offset / (1 - Math.abs(offset) / PITCH_LIMIT);
        lastDragAt = pressStartedAt;
        dragSamples = [{ x: e.clientX, at: pressStartedAt }];
        // Screen coordinates, which do not shrink as the diamond swells
        startX = lastX = e.clientX;
        startY = lastY = e.clientY;
        canvas.setPointerCapture(e.pointerId);
    }

    function handlePointerEnter(e: PointerEvent): void {
        isHovered = e.pointerType === 'mouse';
    }

    function handlePointerLeave(): void {
        isHovered = false;
    }

    function handlePointerMove(e: PointerEvent): void {
        if (!isPressed || e.pointerId !== activePointerId) {
            return;
        }

        // On macOS, Ctrl+click opens a context menu that takes the button release, so `pointerup` never arrives
        if (!e.buttons) {
            handlePointerUp(e);
            return;
        }

        if (!isDragging && Math.hypot(e.clientX - startX, e.clientY - startY) > TOUCH_SLOP) {
            isDragging = true;
        }

        const now = performance.now();
        const deltaYaw = (e.clientX - lastX) * DRAG_SPEED;
        targetYaw += deltaYaw;
        rawPitch += (e.clientY - lastY) * DRAG_SPEED;
        targetPitch = rawPitch / (1 + Math.abs(rawPitch) / PITCH_LIMIT);

        const interval = Math.min(0.1, Math.max(1 / 240, (now - lastDragAt) / 1000));
        yawVelocity = Math.min(
            MAX_DRAG_VELOCITY,
            Math.max(-MAX_DRAG_VELOCITY, deltaYaw / interval)
        );
        lastDragAt = now;

        dragSamples.push({ x: e.clientX, at: now });
        while (dragSamples.length > 2 && dragSamples[0]!.at < now - FLING_SAMPLE_WINDOW * 1000) {
            dragSamples.shift();
        }

        lastX = e.clientX;
        lastY = e.clientY;
    }

    function handlePointerUp(e: PointerEvent): void {
        if (!isPressed || e.pointerId !== activePointerId) {
            return;
        }

        isPressed = false;
        activePointerId = undefined;
        timeSinceRelease = 0;

        const now = performance.now();
        const isTap =
            !isDragging &&
            e.type === 'pointerup' &&
            Math.hypot(e.clientX - startX, e.clientY - startY) <= TOUCH_SLOP &&
            now - pressStartedAt <= MAX_TAP_DURATION_MS;

        if (isTap) {
            turnOnTap();
            return;
        }

        interruptedTurnVelocity = undefined;

        // Held still before letting go, it keeps no speed
        if (e.type !== 'pointerup' || now - lastDragAt > DRAG_MOMENTUM_WINDOW * 1000) {
            yawVelocity = 0;
            return;
        }

        const sample = dragSamples[0];
        const flickSpeed = sample
            ? (e.clientX - sample.x) / Math.max((now - sample.at) / 1000, 1 / 240)
            : 0;
        if (Math.abs(flickSpeed) > FLING_MIN_SPEED) {
            targetYaw = yaw;
            yawSpringVelocity = 0;
            yawVelocity = 0;
            spinVelocity = Math.sign(flickSpeed) * FLING_SPEED;
        }
    }

    function handleInteractionLost(e?: Event): void {
        if (
            e?.type === 'lostpointercapture' &&
            (!isPressed || (e as PointerEvent).pointerId !== activePointerId)
        ) {
            return;
        }

        isHovered = false;
        idleSpeed = 1;

        if (!isPressed) {
            return;
        }

        isPressed = false;
        activePointerId = undefined;
        interruptedTurnVelocity = undefined;
        timeSinceRelease = 0;
        settle();
    }

    // A hidden tab gets no frames anyway; stopping keeps the scene clock from counting the time away
    function updatePlayback(): void {
        if (scene && canvas.isConnected && !document.hidden) {
            resume();
        } else {
            handleInteractionLost();
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
        window.removeEventListener('blur', handleInteractionLost);
        canvas.removeEventListener('webglcontextlost', fail);
        canvas.remove();
        gl!.getExtension('WEBGL_lose_context')?.loseContext();
        callbacks?.onError();
    }

    const unsubscribeFromDegradation = onDiamond3dDegraded(fail);

    document.addEventListener('visibilitychange', updatePlayback);
    window.addEventListener('blur', handleInteractionLost);
    canvas.addEventListener('webglcontextlost', fail);
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);
    canvas.addEventListener('lostpointercapture', handleInteractionLost);
    canvas.addEventListener('pointerenter', handlePointerEnter);
    canvas.addEventListener('pointerleave', handlePointerLeave);
    // Otherwise iOS starts selecting the text around when the diamond is pressed and dragged
    canvas.addEventListener('touchstart', preventDefault, { passive: false });

    createDiamondScene(gl)
        .then(createdScene => {
            scene = createdScene;
            updatePlayback();
        })
        .catch(fail);

    return {
        hasDrawn: () => hasDrawn,
        attach(container, { size, pressScale: attachPressScale }, attachCallbacks) {
            if (canvas.parentElement && canvas.parentElement !== container) {
                callbacks?.onDetach?.();
            }
            callbacks = attachCallbacks;
            pressScale = attachPressScale;
            // A modal closed while the diamond was pressed took the grown diamond with it
            isPressed = false;
            activePointerId = undefined;
            isHovered = false;
            grow = 1;
            growVelocity = 0;
            canvas.style.transform = '';
            if (!animation) {
                settle();
                targetPitch = 0;
                timeSinceRelease = IDLE_RESUME_DURATION;
            }
            // Shown again, it gets the opening's spin again; before the first frame it waits for the still
            kickStart = hasDrawn ? time : undefined;

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

function convertToRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
}
