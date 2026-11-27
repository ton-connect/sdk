// @vitest-environment jsdom
import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { createSignal, Match, Switch } from 'solid-js';
import { render } from 'solid-js/web';
import { Crossfade } from 'src/app/components/crossfade';

// jsdom has no Web Animations: a stand-in whose animations end only when the test says so
let finishAll: () => void;
let started: { el: Element; keyframes: Keyframe[] }[];

beforeEach(() => {
    started = [];
    const pending: (() => void)[] = [];
    finishAll = () => pending.splice(0).forEach(finish => finish());
    Object.defineProperty(Element.prototype, 'animate', {
        configurable: true,
        value(this: Element, keyframes: Keyframe[]) {
            started.push({ el: this, keyframes });
            return { finished: new Promise<void>(resolve => pending.push(resolve)) };
        }
    });
});

let dispose: (() => void) | undefined;
afterEach(() => {
    dispose?.();
    delete (Element.prototype as { animate?: unknown }).animate;
});

const flush = (): Promise<void> => new Promise(resolve => setTimeout(resolve));

function mount(): { root: HTMLElement; show: (screen: 'a' | 'b') => void } {
    const [screen, setScreen] = createSignal<'a' | 'b'>('a');
    const root = document.createElement('div');
    root.style.position = 'relative';
    document.body.appendChild(root);
    dispose = render(
        () => (
            <Crossfade>
                <Switch>
                    <Match when={screen() === 'a'}>
                        <section data-screen="a" />
                    </Match>
                    <Match when={screen() === 'b'}>
                        <section data-screen="b" />
                    </Match>
                </Switch>
            </Crossfade>
        ),
        root
    );
    return { root, show: setScreen };
}

const screens = (root: HTMLElement): (string | undefined)[] =>
    [...root.querySelectorAll<HTMLElement>('[data-screen]')].map(el => el.dataset.screen);

describe('Crossfade', () => {
    it('shows the first screen without fading it in', () => {
        const { root } = mount();

        expect(screens(root)).toEqual(['a']);
        expect(started).toEqual([]);
    });

    // The new screen takes the old one's place at once, so the sheet starts resizing straight away
    it('fades the old screen out of the layout while the new one fades in', async () => {
        const { root, show } = mount();

        show('b');
        await flush();

        expect(screens(root)).toEqual(['b', 'a']);
        const old = root.querySelector<HTMLElement>('[data-screen="a"]')!;
        expect(old.style.position).toBe('absolute');
        expect(old.style.pointerEvents).toBe('none');
        expect(started.map(({ el, keyframes }) => [el, keyframes[0].opacity])).toEqual([
            [old, 1],
            [root.querySelector('[data-screen="b"]'), 0]
        ]);
    });

    it('removes the old screen once it has faded out', async () => {
        const { root, show } = mount();

        show('b');
        await flush();
        finishAll();
        await flush();

        expect(screens(root)).toEqual(['b']);
    });
});
