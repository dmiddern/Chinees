function ensureAllFilterForSearch(input) {
  const value = input?.value || "";
  if (!value.trim()) return;

  const wordsPage = input.closest(".words-page");
  if (!wordsPage) return;

  const allButton = [...wordsPage.querySelectorAll(".filter-chips button")]
    .find((button) => button.textContent?.trim() === "Alles");

  if (allButton && !allButton.classList.contains("active")) {
    allButton.click();
  }
}

function forceReactInput(input) {
  const value = input.value;
  if (!value) return;

  // iOS Chinese handwriting/IME can update the visible input value at the end
  // of composition without React seeing a normal onChange. Use the native value
  // setter so React's value tracker notices the change, then emit a real input
  // event. This makes the current Hanzi immediately become the React search query.
  const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
  const nativeSetter = descriptor?.set;
  if (!nativeSetter) return;

  nativeSetter.call(input, "");
  nativeSetter.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
}

function installChineseSearchFix() {
  const input = document.querySelector('.words-page .search-box input');
  if (!input || input.dataset.chineseSearchFix === "2") return;

  input.dataset.chineseSearchFix = "2";

  input.addEventListener("input", () => {
    ensureAllFilterForSearch(input);
  }, true);

  input.addEventListener("change", () => {
    ensureAllFilterForSearch(input);
  }, true);

  input.addEventListener("compositionend", () => {
    ensureAllFilterForSearch(input);
    queueMicrotask(() => forceReactInput(input));
  }, true);
}

let scheduled = false;
function scheduleInstall() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    installChineseSearchFix();
  });
}

new MutationObserver(scheduleInstall).observe(document.documentElement, { childList: true, subtree: true });
document.addEventListener("DOMContentLoaded", scheduleInstall);
scheduleInstall();
