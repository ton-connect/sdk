import { createSignal } from 'solid-js';
import { getWindow } from 'src/app/utils/web-api';

const [windowHeight, setWindowHeight] = createSignal(getWindow()?.innerHeight || 0);

if (getWindow()) {
    window.addEventListener('resize', () => setWindowHeight(window.innerHeight));
}

export default windowHeight;
