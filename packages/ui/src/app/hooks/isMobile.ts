import { createSignal } from 'solid-js';
import { isDevice } from 'src/app/styles/media';
import { getWindow } from 'src/app/utils/web-api';

const [isMobile, setIsMobile] = createSignal(isDevice('mobile'));

const updateIsMobile = (): boolean => setIsMobile(isDevice('mobile'));

if (getWindow()) {
    window.addEventListener('resize', () => updateIsMobile());

    // Browsers may throttle `resize` if page hasn't loaded, so recalculate on page `load`
    window.addEventListener('load', () => updateIsMobile(), { once: true });
}

export { isMobile, updateIsMobile };
