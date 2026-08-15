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

  if (notifyReactDirectly(input)) return;
  input.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
}

function setDrawnCharacterAsRealInput(input, character) {
  const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
  const nativeSetter = descriptor?.set;
  const nextValue = `${input.value || ""}${character}`;

  if (nativeSetter) nativeSetter.call(input, nextValue);
  else input.value = nextValue;

  try {
    input.dispatchEvent(new InputEvent("input", {
      bubbles: true,
      composed: true,
      inputType: "insertText",
      data: character,
    }));
  } catch {
    input.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
  }

  requestAnimationFrame(() => {
    syncSearch(input);
    input.focus();
  });
}

function installDrawResultFix() {
  if (document.documentElement.dataset.drawSearchReactFix === "1") return;
  document.documentElement.dataset.drawSearchReactFix = "1";

  document.addEventListener("click", (event) => {
    const button = event.target.closest?.(".draw-results button");
    if (!button) return;

    const character = button.textContent?.trim();
    const input = document.querySelector('.words-page .search-box input');
    if (!character || !input) return;

    // handwriting.ts mutates input.value directly. For a React-controlled input
    // that also updates React's internal value tracker, so its synthetic
    // onChange can ignore the following input event. Replace that click action
    // completely and write through the native prototype setter instead.
    event.preventDefault();
    event.stopImmediatePropagation();
    setDrawnCharacterAsRealInput(input, character);
    document.querySelector(".hanzi-overlay")?.remove();
  }, true);
}

function installChineseSearchFix() {
  const input = document.querySelector('.words-page .search-box input');
  if (!input || input.dataset.chineseSearchFix === "4") return;

  input.dataset.chineseSearchFix = "4";

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
    installDrawResultFix();
  });
}

new MutationObserver(scheduleInstall).observe(document.documentElement, { childList: true, subtree: true });
document.addEventListener("DOMContentLoaded", scheduleInstall);
scheduleInstall();
