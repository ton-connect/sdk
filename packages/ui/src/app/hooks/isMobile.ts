import { createSignal } from 'solid-js';
import { isDevice } from 'src/app/styles/media';
import { getWindow } from 'src/app/utils/web-api';

const [isMobile, setIsMobile] = createSignal(isDevice('mobile'));

const updateIsMobile = (): void => setIsMobile(isDevice('mobile'));

if (getWindow()) {
    // It's important to check the device type on page load because the value of window.innerWidth can change after the page has loaded
    window.addEventListener('load', () => updateIsMobile());

    window.addEventListener('resize', () => updateIsMobile());
}

export { isMobile, updateIsMobile };
