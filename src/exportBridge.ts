import { wordsData } from "./data/words";

declare global {
  interface Window {
    __chineesWords?: typeof wordsData;
  }
}

window.__chineesWords = wordsData;
window.dispatchEvent(new Event("chinees:words-ready"));

export {};
