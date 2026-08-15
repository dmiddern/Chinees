import { deleteCustomWord, loadCustomWords } from "./customWords";

const CUSTOM_LISTS_STORAGE_KEY = "chinees.custom-lists.v1";
const SCROLL_RESTORE_KEY = "chinees.delete-scroll-y";

function normalized(value: string | null | undefined) {
  return (value || "").replace(/⊕/g, "").trim().toLocaleLowerCase();
}

function reloadKeepingScrollPosition() {
  window.sessionStorage.setItem(SCROLL_RESTORE_KEY, String(window.scrollY));
  window.location.reload();
}

function restoreScrollPosition() {
  const stored = window.sessionStorage.getItem(SCROLL_RESTORE_KEY);
  if (stored === null) return;
  window.sessionStorage.removeItem(SCROLL_RESTORE_KEY);
  const top = Number(stored);
  if (!Number.isFinite(top)) return;

  // Wacht tot React en de woordenlijst opnieuw gerenderd zijn voordat we
  // terugscrollen. Een tweede frame voorkomt dat iOS Safari ons nadien weer
  // naar boven trekt wanneer de layout nog aan het stabiliseren is.
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => window.scrollTo({ top, behavior: "auto" }));
  });
}

function installWordDeleteButtons() {
  const customWords = loadCustomWords();
  document.querySelectorAll<HTMLElement>(".word-row").forEach((row) => {
    if (!row.querySelector(".custom-word-mark")) return;
    if (row.querySelector(".custom-word-delete")) return;

    const hanzi = row.querySelector<HTMLElement>(".word-hanzi")?.textContent?.trim() || "";
    const pinyin = normalized(row.querySelector<HTMLElement>(".word-info strong")?.textContent);
    const word = customWords.find((item) => item.hanzi.trim() === hanzi && normalized(item.pinyin) === pinyin);
    if (!word) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "custom-word-delete";
    button.textContent = "🗑";
    button.title = "Verwijder eigen woord";
    button.setAttribute("aria-label", `Verwijder ${word.hanzi}`);
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!window.confirm(`Wil je het eigen woord “${word.hanzi}” verwijderen?`)) return;
      if (deleteCustomWord(word.id)) reloadKeepingScrollPosition();
    });
    row.appendChild(button);
  });
}

function installListDeleteButtons() {
  const container = document.querySelector<HTMLElement>(".custom-list-chips");
  if (!container) return;

  const listButtons = Array.from(container.children).filter(
    (child): child is HTMLButtonElement => child instanceof HTMLButtonElement && !child.classList.contains("custom-list-delete"),
  );

  listButtons.forEach((listButton, index) => {
    if (listButton.dataset.deleteControlInstalled === "true") return;
    listButton.dataset.deleteControlInstalled = "true";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "custom-list-delete";
    deleteButton.textContent = "🗑";
    deleteButton.title = "Verwijder woordenlijst";
    const listName = listButton.querySelector("strong")?.textContent?.trim() || `lijst ${index + 1}`;
    deleteButton.setAttribute("aria-label", `Verwijder ${listName}`);

    deleteButton.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!window.confirm(`Wil je de lijst “${listName}” verwijderen?`)) return;
      try {
        const lists = JSON.parse(window.localStorage.getItem(CUSTOM_LISTS_STORAGE_KEY) || "[]") as unknown[];
        if (!Array.isArray(lists) || !lists[index]) return;
        const next = lists.filter((_, itemIndex) => itemIndex !== index);
        window.localStorage.setItem(CUSTOM_LISTS_STORAGE_KEY, JSON.stringify(next));
        reloadKeepingScrollPosition();
      } catch {
        return;
      }
    });

    listButton.insertAdjacentElement("afterend", deleteButton);
  });
}

function clarifyListMembershipButtons() {
  document.querySelectorAll<HTMLButtonElement>(".row-list-toggle.added").forEach((button) => {
    if (button.dataset.removeLabelInstalled === "true") return;
    button.dataset.removeLabelInstalled = "true";
    button.textContent = "−";
    button.title = "Verwijder uit deze lijst";
  });
}

function installAll() {
  installWordDeleteButtons();
  installListDeleteButtons();
  clarifyListMembershipButtons();
}

export function installCustomDeleteControls() {
  restoreScrollPosition();
  installAll();
  const observer = new MutationObserver(() => installAll());
  observer.observe(document.body, { childList: true, subtree: true });
}
