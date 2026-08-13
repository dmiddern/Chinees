const WIKTIONARY_BASE = "https://en.wiktionary.org/wiki/Special:Search?search=";
const CUSTOM_LISTS_KEY = "chinees.custom-lists.v1";
const DAILY_SETS_KEY = "chinees.daily-sets.v1";
const LEARNING_SESSION_KEY = "chinees.learning-session.v1";
const LAST_LIST_KEY = "chinees.last-custom-list.v1";
const CUSTOM_LISTS_DIRTY_KEY = "chinees.custom-lists-external-dirty";
const OPEN_WORDS_AFTER_RELOAD_KEY = "chinees.open-words-after-reload";

function wiktionaryUrl(term) {
  return `${WIKTIONARY_BASE}${encodeURIComponent(term)}`;
}

function readJson(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return value ?? fallback;
  } catch {
    return fallback;
  }
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

function currentExerciseWordId() {
  const session = readJson(LEARNING_SESSION_KEY, null);
  if (!session || !Array.isArray(session.queue)) return null;
  const exercise = session.queue[session.index];
  return Number.isFinite(exercise?.wordId) ? exercise.wordId : null;
}

function chosenListId(lists) {
  const remembered = localStorage.getItem(LAST_LIST_KEY) || "";
  if (lists.some((list) => list.id === remembered)) return remembered;
  return lists[0]?.id || "";
}

function refreshPracticeListAdder(container) {
  const lists = readJson(CUSTOM_LISTS_KEY, []);
  const select = container.querySelector("select");
  const button = container.querySelector("button");
  const empty = container.querySelector(".practice-list-empty");
  if (!select || !button || !empty) return;

  const currentValue = select.value;
  const selectedId = lists.some((list) => list.id === currentValue) ? currentValue : chosenListId(lists);
  const signature = lists.map((list) => `${list.id}:${list.name}:${list.wordIds?.length || 0}`).join("|");

  if (container.dataset.signature !== signature) {
    select.replaceChildren();
    lists.forEach((list) => {
      const option = document.createElement("option");
      option.value = list.id;
      option.textContent = list.name;
      select.append(option);
    });
    container.dataset.signature = signature;
  }

  if (selectedId) select.value = selectedId;
  select.hidden = lists.length === 0;
  button.hidden = lists.length === 0;
  empty.hidden = lists.length > 0;

  const wordId = currentExerciseWordId();
  const selectedList = lists.find((list) => list.id === select.value);
  const alreadyAdded = Boolean(selectedList?.wordIds?.includes(wordId));
  button.disabled = !wordId || !selectedList || alreadyAdded;
  button.textContent = alreadyAdded ? "✓ In lijst" : "+ Voeg toe";
}

function addPracticeListAdder() {
  const page = document.querySelector(".learn-page");
  if (!page) return;
  let container = page.querySelector(".practice-list-adder");
  if (!container) {
    container = document.createElement("div");
    container.className = "practice-list-adder";

    const label = document.createElement("span");
    label.textContent = "Bewaar dit woord";

    const controls = document.createElement("div");
    const select = document.createElement("select");
    select.setAttribute("aria-label", "Kies woordenlijst");
    select.addEventListener("change", () => {
      localStorage.setItem(LAST_LIST_KEY, select.value);
      refreshPracticeListAdder(container);
    });

    const button = document.createElement("button");
    button.type = "button";
    button.addEventListener("click", () => {
      const wordId = currentExerciseWordId();
      const listId = select.value;
      if (!wordId || !listId) return;

      const lists = readJson(CUSTOM_LISTS_KEY, []);
      const index = lists.findIndex((list) => list.id === listId);
      if (index < 0) return;
      localStorage.setItem(LAST_LIST_KEY, listId);

      if (!lists[index].wordIds.includes(wordId)) {
        lists[index] = {
          ...lists[index],
          wordIds: [...lists[index].wordIds, wordId],
          updatedAt: Date.now(),
        };
        localStorage.setItem(CUSTOM_LISTS_KEY, JSON.stringify(lists));
        sessionStorage.setItem(CUSTOM_LISTS_DIRTY_KEY, "1");
      }
      refreshPracticeListAdder(container);
    });

    const empty = document.createElement("small");
    empty.className = "practice-list-empty";
    empty.textContent = "Maak eerst een eigen lijst bij Woorden.";

    controls.append(select, button);
    container.append(label, controls, empty);
    page.querySelector(".flashcard")?.insertAdjacentElement("afterend", container);
  }
  refreshPracticeListAdder(container);
}

function formatDateLabel(date) {
  try {
    return new Intl.DateTimeFormat("nl-BE", { day: "numeric", month: "short", year: "numeric" })
      .format(new Date(`${date}T12:00:00`));
  } catch {
    return date;
  }
}

function exportSources() {
  const dailySets = readJson(DAILY_SETS_KEY, {});
  const lists = readJson(CUSTOM_LISTS_KEY, []);
  const days = Object.values(dailySets)
    .filter((set) => set?.date && Array.isArray(set.wordIds))
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((set) => ({
      id: `day:${set.date}`,
      kind: "Daglijst",
      label: formatDateLabel(set.date),
      wordIds: set.wordIds,
    }));
  const customs = lists.map((list) => ({
    id: `list:${list.id}`,
    kind: "Eigen lijst",
    label: list.name,
    wordIds: list.wordIds || [],
  }));
  return [...days, ...customs];
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function exportSelectedSources(panel) {
  const selectedIds = [...panel.querySelectorAll('input[type="checkbox"]:checked')].map((input) => input.value);
  const sources = exportSources().filter((source) => selectedIds.includes(source.id));
  const wordIds = [...new Set(sources.flatMap((source) => source.wordIds))];
  const allWords = Array.isArray(window.__chineesWords) ? window.__chineesWords : [];
  const byId = new Map(allWords.map((word) => [word.id, word]));
  const selectedWords = wordIds.map((id) => byId.get(id)).filter(Boolean);
  if (!selectedWords.length) return;

  const lines = [
    ["Chinees", "Pinyin", "Vertaling"],
    ...selectedWords.map((word) => [word.hanzi, word.pinyin, word.meaningNl]),
  ];
  const csv = `\uFEFF${lines.map((row) => row.map(csvCell).join(";")).join("\r\n")}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `chinees-woorden-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function updateExportSummary(panel) {
  const checked = [...panel.querySelectorAll('input[type="checkbox"]:checked')];
  const sourceIds = checked.map((input) => input.value);
  const sources = exportSources().filter((source) => sourceIds.includes(source.id));
  const uniqueCount = new Set(sources.flatMap((source) => source.wordIds)).size;
  const count = panel.querySelector(".export-count");
  const button = panel.querySelector(".export-download");
  if (count) count.textContent = checked.length ? `${checked.length} lijsten · ${uniqueCount} unieke woorden` : "Selecteer minstens één lijst";
  if (button) button.disabled = uniqueCount === 0 || !Array.isArray(window.__chineesWords);
}

function addExportPanel() {
  const listsSection = document.querySelector(".words-page .custom-lists");
  if (!listsSection) return;
  const sources = exportSources();
  const signature = sources.map((source) => `${source.id}:${source.label}:${source.wordIds.length}`).join("|");
  let panel = document.querySelector(".word-export-panel");
  const previousSelected = panel
    ? new Set([...panel.querySelectorAll('input[type="checkbox"]:checked')].map((input) => input.value))
    : new Set();

  if (panel && panel.dataset.signature === signature) {
    updateExportSummary(panel);
    return;
  }

  if (!panel) {
    panel = document.createElement("details");
    panel.className = "word-export-panel custom-lists";
    listsSection.insertAdjacentElement("afterend", panel);
  }
  panel.dataset.signature = signature;
  panel.replaceChildren();

  const summary = document.createElement("summary");
  summary.innerHTML = "<strong>Exporteren</strong><span>Daglijsten + eigen lijsten</span>";
  panel.append(summary);

  const intro = document.createElement("p");
  intro.className = "export-intro";
  intro.textContent = "Combineer één of meer gegenereerde daglijsten en eigen lijsten. Dubbele woorden worden automatisch samengevoegd.";
  panel.append(intro);

  const toolbar = document.createElement("div");
  toolbar.className = "export-toolbar";
  const selectAll = document.createElement("button");
  selectAll.type = "button";
  selectAll.textContent = "Selecteer alles";
  selectAll.addEventListener("click", () => {
    panel.querySelectorAll('input[type="checkbox"]').forEach((input) => { input.checked = true; });
    updateExportSummary(panel);
  });
  const clear = document.createElement("button");
  clear.type = "button";
  clear.textContent = "Wis selectie";
  clear.addEventListener("click", () => {
    panel.querySelectorAll('input[type="checkbox"]').forEach((input) => { input.checked = false; });
    updateExportSummary(panel);
  });
  toolbar.append(selectAll, clear);
  panel.append(toolbar);

  const sourceList = document.createElement("div");
  sourceList.className = "export-source-list";
  sources.forEach((source) => {
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = source.id;
    input.checked = previousSelected.has(source.id);
    input.addEventListener("change", () => updateExportSummary(panel));
    const text = document.createElement("span");
    text.innerHTML = `<strong>${source.label}</strong><small>${source.kind} · ${source.wordIds.length} woorden</small>`;
    label.append(input, text);
    sourceList.append(label);
  });
  panel.append(sourceList);

  const footer = document.createElement("div");
  footer.className = "export-footer";
  const count = document.createElement("small");
  count.className = "export-count";
  const download = document.createElement("button");
  download.type = "button";
  download.className = "button primary-button export-download";
  download.textContent = "Exporteer CSV";
  download.addEventListener("click", () => exportSelectedSources(panel));
  footer.append(count, download);
  panel.append(footer);
  updateExportSummary(panel);
}

function protectExternalListChanges() {
  document.querySelectorAll(".bottom-nav button").forEach((button) => {
    if (button.dataset.listReloadGuard) return;
    if (!button.textContent?.includes("Woorden")) return;
    button.dataset.listReloadGuard = "1";
    button.addEventListener("click", (event) => {
      if (sessionStorage.getItem(CUSTOM_LISTS_DIRTY_KEY) !== "1") return;
      event.preventDefault();
      event.stopImmediatePropagation();
      sessionStorage.setItem(OPEN_WORDS_AFTER_RELOAD_KEY, "1");
      window.location.reload();
    }, true);
  });
}

function restoreWordsTabAfterReload() {
  if (sessionStorage.getItem(OPEN_WORDS_AFTER_RELOAD_KEY) !== "1") return;
  const button = [...document.querySelectorAll(".bottom-nav button")].find((item) => item.textContent?.includes("Woorden"));
  if (!button) return;
  sessionStorage.removeItem(OPEN_WORDS_AFTER_RELOAD_KEY);
  sessionStorage.removeItem(CUSTOM_LISTS_DIRTY_KEY);
  button.click();
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
    .row-wiktionary:active { transform: scale(0.97); }
    .sheet-wiktionary {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 0.7rem;
      text-decoration: none;
    }
    .practice-list-adder {
      margin-top: 12px;
      padding: 12px 14px;
      border: 1px solid var(--border, #ddd4ce);
      border-radius: 15px;
      background: var(--surface, #f7f3ef);
      display: grid;
      gap: 8px;
    }
    .practice-list-adder > span { font-size: 11px; font-weight: 800; color: var(--secondary, #756b65); }
    .practice-list-adder > div { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 8px; }
    .practice-list-adder select {
      min-width: 0;
      border: 1px solid var(--border, #ddd4ce);
      border-radius: 11px;
      background: var(--background, #fff);
      padding: 10px 12px;
      font: inherit;
      font-size: 13px;
    }
    .practice-list-adder button {
      border: 0;
      border-radius: 11px;
      background: var(--primary, #4f4038);
      color: var(--background, #fff);
      padding: 0 14px;
      font-size: 12px;
      font-weight: 800;
    }
    .practice-list-adder button:disabled { opacity: .55; }
    .practice-list-empty { color: var(--secondary, #756b65); }
    .word-export-panel { margin-top: -6px; }
    .word-export-panel > summary {
      list-style: none;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      cursor: pointer;
    }
    .word-export-panel > summary::-webkit-details-marker { display: none; }
    .word-export-panel > summary strong { font-size: 16px; }
    .word-export-panel > summary span { color: var(--secondary, #756b65); font-size: 11px; }
    .export-intro { margin: 12px 0 0; color: var(--secondary, #756b65); font-size: 11px; line-height: 1.5; }
    .export-toolbar { display: flex; gap: 8px; margin-top: 12px; }
    .export-toolbar button {
      border: 1px solid var(--border, #ddd4ce);
      border-radius: 999px;
      background: var(--background, #fff);
      padding: 6px 9px;
      font-size: 10px;
      font-weight: 750;
    }
    .export-source-list { margin-top: 10px; max-height: 260px; overflow-y: auto; border-top: 1px solid var(--border, #ddd4ce); }
    .export-source-list label {
      min-height: 48px;
      display: flex;
      align-items: center;
      gap: 10px;
      border-bottom: 1px solid var(--border, #ddd4ce);
      cursor: pointer;
    }
    .export-source-list input { width: 18px; height: 18px; accent-color: var(--primary, #4f4038); }
    .export-source-list span { min-width: 0; }
    .export-source-list strong, .export-source-list small { display: block; }
    .export-source-list strong { font-size: 12px; }
    .export-source-list small { margin-top: 2px; color: var(--secondary, #756b65); font-size: 10px; }
    .export-footer { margin-top: 12px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .export-footer small { color: var(--secondary, #756b65); font-size: 10px; }
    .export-footer .button { min-height: 40px; padding: 0 14px; }
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
        color: #3f352f;
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        font-size: 0.82rem;
        font-weight: 800;
      }
      .export-footer { align-items: stretch; flex-direction: column; }
      .export-footer .button { width: 100%; }
    }
  `;
  document.head.append(style);
}

let scheduled = false;
function enhanceWords() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    applyStyles();
    addResultLinks();
    addSheetLink();
    addPracticeListAdder();
    addExportPanel();
    protectExternalListChanges();
    restoreWordsTabAfterReload();
  });
}

const observer = new MutationObserver(enhanceWords);
observer.observe(document.documentElement, { childList: true, subtree: true });

window.addEventListener("chinees:words-ready", enhanceWords);
document.addEventListener("DOMContentLoaded", enhanceWords);
enhanceWords();
