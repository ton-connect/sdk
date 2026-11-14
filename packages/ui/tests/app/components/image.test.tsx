// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render } from 'solid-js/web';
import { ThemeProvider } from 'solid-styled-components';
import { Image } from 'src/app/components/image';

const theme = { colors: { background: { secondary: '#f0f0f0' } } };

const SRC = 'https://example.com/wallet-icon.png';

class MockIntersectionObserver {
    public static instances: MockIntersectionObserver[] = [];

    public observed: Element[] = [];

    public disconnected = false;

    constructor(
        public callback: IntersectionObserverCallback,
        public options?: IntersectionObserverInit
    ) {
        MockIntersectionObserver.instances.push(this);
    }

    public observe(el: Element): void {
        this.observed.push(el);
    }

    public disconnect(): void {
        this.disconnected = true;
    }

    public unobserve(): void {}

    public takeRecords(): IntersectionObserverEntry[] {
        return [];
    }

    public intersect(isIntersecting: boolean): void {
        this.callback(
            [{ isIntersecting } as IntersectionObserverEntry],
            this as unknown as IntersectionObserver
        );
    }
}

function stubImageConstructor(opts: { complete: boolean }): HTMLImageElement[] {
    const created: HTMLImageElement[] = [];
    vi.stubGlobal(
        'Image',
        function () {
            const el = document.createElement('img');
            Object.defineProperty(el, 'complete', { value: opts.complete, configurable: true });
            created.push(el);
            return el;
        } as unknown as typeof window.Image
    );
    return created;
}

function mount(): { container: HTMLElement; dispose: () => void } {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const dispose = render(
        () => (
            <ThemeProvider theme={theme}>
                <Image src={SRC} />
            </ThemeProvider>
        ),
        container
    );
    return { container, dispose };
}

afterEach(() => {
    vi.unstubAllGlobals();
    MockIntersectionObserver.instances = [];
    document.body.innerHTML = '';
});

describe('Image lazy loading', () => {
    it('falls back to immediate loading when IntersectionObserver is unavailable', () => {
        vi.stubGlobal('IntersectionObserver', undefined);
        const created = stubImageConstructor({ complete: false });

        const { container, dispose } = mount();

        // loading starts right away (legacy behavior)
        expect(created.length).toBe(1);
        expect(created[0]!.src).toBe(SRC);
        // placeholder is shown until the image loads
        expect(container.querySelectorAll('img').length).toBe(0);

        created[0]!.dispatchEvent(new Event('load'));
        expect(container.querySelectorAll('img').length).toBe(1);

        dispose();
    });

    it('defers loading until the placeholder intersects the viewport', () => {
        vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
        const created = stubImageConstructor({ complete: false });

        const { container, dispose } = mount();

        // nothing is downloaded before intersection
        expect(created.length).toBe(0);
        expect(MockIntersectionObserver.instances.length).toBe(1);

        const observer = MockIntersectionObserver.instances[0]!;
        expect(observer.observed.length).toBe(1);
        // prefetch margin so icons start loading slightly before they are visible
        expect(observer.options?.rootMargin).toBe('150px');

        // non-intersecting notification must not trigger loading
        observer.intersect(false);
        expect(created.length).toBe(0);

        observer.intersect(true);
        expect(created.length).toBe(1);
        expect(created[0]!.src).toBe(SRC);
        expect(observer.disconnected).toBe(true);

        created[0]!.dispatchEvent(new Event('load'));
        expect(container.querySelectorAll('img').length).toBe(1);

        dispose();
    });

    it('renders a cached image synchronously after intersection', () => {
        vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
        stubImageConstructor({ complete: true });

        const { container, dispose } = mount();

        expect(container.querySelectorAll('img').length).toBe(0);
        MockIntersectionObserver.instances[0]!.intersect(true);
        // complete (cached) images swap in without waiting for a load event
        expect(container.querySelectorAll('img').length).toBe(1);

        dispose();
    });

    it('disconnects the observer when unmounted before intersecting', () => {
        vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
        stubImageConstructor({ complete: false });

        const { dispose } = mount();
        const observer = MockIntersectionObserver.instances[0]!;
        expect(observer.disconnected).toBe(false);

        dispose();
        expect(observer.disconnected).toBe(true);
    });
});
