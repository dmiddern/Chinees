const HANZI_RE = /[\u3400-\u9fff]/u;

function ensureAllFilterForChineseSearch(input) {
  const value = input?.value || "";
  if (!HANZI_RE.test(value)) return;

  const wordsPage = input.closest(".words-page");
  if (!wordsPage) return;

  const allButton = [...wordsPage.querySelectorAll(".filter-chips button")]
    .find((button) => button.textContent?.trim() === "Alles");

  if (allButton && !allButton.classList.contains("active")) {
    allButton.click();
  }
}

function installChineseSearchFix() {
  const input = document.querySelector('.words-page .search-box input');
  if (!input || input.dataset.chineseSearchFix === "1") return;

  input.dataset.chineseSearchFix = "1";

  const handle = () => {
    ensureAllFilterForChineseSearch(input);
  };

  input.addEventListener("input", handle, true);
  input.addEventListener("change", handle, true);
  input.addEventListener("compositionend", handle, true);
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
