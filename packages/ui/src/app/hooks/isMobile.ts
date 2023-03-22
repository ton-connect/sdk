import { createSignal } from 'solid-js';
import { isDevice } from 'src/app/styles/media';
import { getWindow } from 'src/app/utils/web-api';

const [isMobile, setIsMobile] = createSignal(isDevice('mobile'));

if (getWindow()) {
    window.addEventListener('resize', () => setIsMobile(isDevice('mobile')));
}

export default isMobile;
