const WIKTIONARY_BASE = "https://en.wiktionary.org/wiki/Special:Search?search=";

function wiktionaryUrl(term) {
  return `${WIKTIONARY_BASE}${encodeURIComponent(term)}`;
}

function createLink(term, className, label) {
  const link = document.createElement("a");
  link.className = className;
  link.href = wiktionaryUrl(term);
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.setAttribute("aria-label", `${label} op Wiktionary`);
  link.title = "Open op Wiktionary";
  link.textContent = "Wiktionary ↗";
  link.addEventListener("click", (event) => event.stopPropagation());
  return link;
}

function addResultLinks() {
  document.querySelectorAll(".word-row").forEach((row) => {
    if (row.querySelector(".row-wiktionary")) return;
    const hanzi = row.querySelector(".word-hanzi")?.textContent?.trim();
    if (!hanzi) return;
    row.append(createLink(hanzi, "row-wiktionary", hanzi));
  });
}

function addSheetLink() {
  const sheet = document.querySelector(".word-sheet");
  if (!sheet || sheet.querySelector(".sheet-wiktionary")) return;
  const hanzi = sheet.querySelector(".sheet-hanzi")?.textContent?.trim();
  if (!hanzi) return;
  const audioButton = sheet.querySelector(".audio-button");
  const link = createLink(hanzi, "sheet-wiktionary button secondary-button full-button", hanzi);
  if (audioButton) audioButton.insertAdjacentElement("afterend", link);
  else sheet.append(link);
}

function applyStyles() {
  if (document.getElementById("wiktionary-link-styles")) return;
  const style = document.createElement("style");
  style.id = "wiktionary-link-styles";
  style.textContent = `
    .row-wiktionary {
      align-self: center;
      flex: 0 0 auto;
      margin-right: 0.35rem;
      padding: 0.45rem 0.6rem;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 700;
      line-height: 1;
      text-decoration: none;
      color: inherit;
      background: rgba(0, 0, 0, 0.055);
      white-space: nowrap;
    }

    .row-wiktionary:active {
      transform: scale(0.97);
    }

    .sheet-wiktionary {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 0.7rem;
      text-decoration: none;
    }

    @media (max-width: 520px) {
      .row-wiktionary {
        width: 2.3rem;
        height: 2.3rem;
        padding: 0;
        overflow: hidden;
        color: transparent;
        position: relative;
      }

      .row-wiktionary::after {
        content: "W";
        color: currentColor;
        color: #3f352f;
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        font-size: 0.82rem;
        font-weight: 800;
      }
    }
  `;
  document.head.append(style);
}

function enhanceWords() {
  applyStyles();
  addResultLinks();
  addSheetLink();
}

const observer = new MutationObserver(enhanceWords);
observer.observe(document.documentElement, { childList: true, subtree: true });

document.addEventListener("DOMContentLoaded", enhanceWords);
enhanceWords();
