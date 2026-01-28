import { Buffer } from "buffer"

declare global {
  interface Window {
    Buffer: typeof Buffer
  }
}

if (typeof window !== "undefined" && !window.Buffer) {
  window.Buffer = Buffer
}
