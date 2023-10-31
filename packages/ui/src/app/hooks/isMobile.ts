import { createSignal } from 'solid-js';
import { isDevice } from 'src/app/styles/media';
import { getWindow } from 'src/app/utils/web-api';

const [isMobile, setIsMobile] = createSignal(isDevice('mobile'));

if (getWindow()) {
    // It's important to check the device type on page load because the value of window.innerWidth can change after the page has loaded
    window.addEventListener('load', () => setIsMobile(isDevice('mobile')));

    window.addEventListener('resize', () => setIsMobile(isDevice('mobile')));
}

export default isMobile;
