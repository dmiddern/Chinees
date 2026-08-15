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

function notifyReactDirectly(input) {
  const propsKey = Object.keys(input).find((key) => key.startsWith("__reactProps$"));
  const props = propsKey ? input[propsKey] : null;
  if (typeof props?.onChange !== "function") return false;

  props.onChange({
    target: input,
    currentTarget: input,
    type: "change",
    nativeEvent: null,
    isDefaultPrevented: () => false,
    isPropagationStopped: () => false,
    preventDefault() {},
    stopPropagation() {},
    persist() {},
  });
  return true;
}

function syncSearch(input) {
  ensureAllFilterForSearch(input);

  // iOS Chinese handwriting/IME may commit the visible Hanzi without React's
  // synthetic onChange being emitted reliably. Calling the current React prop
  // directly guarantees that WordList's setQuery receives input.value.
  if (notifyReactDirectly(input)) return;

  // Fallback for non-React or changed internals.
  input.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
}

function installChineseSearchFix() {
  const input = document.querySelector('.words-page .search-box input');
  if (!input || input.dataset.chineseSearchFix === "3") return;

  input.dataset.chineseSearchFix = "3";

  input.addEventListener("input", () => {
    queueMicrotask(() => syncSearch(input));
  }, true);

  input.addEventListener("change", () => {
    ensureAllFilterForSearch(input);
  }, true);

  input.addEventListener("compositionend", () => {
    requestAnimationFrame(() => syncSearch(input));
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
