import {Buffer} from 'buffer';

declare global {
  interface Window {
    Buffer: typeof Buffer;
  }
}

if (window && !window.Buffer) {
  window.Buffer = Buffer;
}
