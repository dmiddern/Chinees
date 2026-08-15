function ensureAllFilterForActiveSearch(input) {
  const value = input?.value?.trim() || "";
  if (!value) return;

  const wordsPage = input.closest(".words-page");
  if (!wordsPage) return;

  const allButton = [...wordsPage.querySelectorAll(".filter-chips button")]
    .find((button) => button.textContent?.trim() === "Alles");

  if (allButton && !allButton.classList.contains("active")) {
    allButton.click();
  }
}

function installGlobalWordSearchFix() {
  const input = document.querySelector('.words-page .search-box input');
  if (!input || input.dataset.globalWordSearchFix === "1") return;

  input.dataset.globalWordSearchFix = "1";

  const handle = () => {
    ensureAllFilterForActiveSearch(input);
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
    installGlobalWordSearchFix();
  });
}

new MutationObserver(scheduleInstall).observe(document.documentElement, { childList: true, subtree: true });
document.addEventListener("DOMContentLoaded", scheduleInstall);
scheduleInstall();
