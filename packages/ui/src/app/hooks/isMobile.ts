import { createSignal } from 'solid-js';
import { isDevice } from 'src/app/styles/media';

const [isMobile, setIsMobile] = createSignal(isDevice('mobile'));

window.addEventListener('resize', () => setIsMobile(isDevice('mobile')));

export default isMobile;
