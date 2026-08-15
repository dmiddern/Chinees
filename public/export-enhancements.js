const CUSTOM_WORDS_KEY = "chinese-custom-words-v1";
const CUSTOM_LISTS_KEY = "chinees.custom-lists.v1";
const DAILY_SETS_KEY = "chinees.daily-sets.v1";
const HSK_LEVELS = [1, 2, 3, 4, 5, 6, "7-9"];

function readExportJson(key, fallback) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "null");
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function customAddedWords() {
  const words = readExportJson(CUSTOM_WORDS_KEY, []);
  if (!Array.isArray(words)) return [];
  return words.filter((word) => word?.hanzi && word?.pinyin && word?.meaningNl);
}

function allExportWords() {
  const builtIn = Array.isArray(window.__chineesWords) ? window.__chineesWords : [];
  const custom = customAddedWords();
  const byId = new Map();
  [...builtIn, ...custom].forEach((word) => byId.set(word.id, word));
  return [...byId.values()];
}

function enhancedExportSources() {
  const words = allExportWords();
  const builtIn = words.filter((word) => !word.custom && word.source !== "custom");
  const custom = words.filter((word) => word.custom || word.source === "custom");
  const dailySets = readExportJson(DAILY_SETS_KEY, {});
  const lists = readExportJson(CUSTOM_LISTS_KEY, []);

  const hsk = HSK_LEVELS.map((level) => ({
    id: `hsk:${level}`,
    kind: "HSK-niveau",
    label: `HSK ${level}`,
    wordIds: builtIn.filter((word) => String(word.level) === String(level)).map((word) => word.id),
  })).filter((source) => source.wordIds.length > 0);

  const added = custom.length
    ? [{
      id: "custom:added",
      kind: "Eigen toegevoegde woorden",
      label: "(+) Eigen toegevoegde woorden",
      wordIds: custom.map((word) => word.id),
    }]
    : [];

  const days = Object.values(dailySets)
    .filter((set) => set?.date && Array.isArray(set.wordIds))
    .map((set) => ({ id: `day:${set.date}`, wordIds: set.wordIds }));

  const ownLists = Array.isArray(lists)
    ? lists.map((list) => ({ id: `list:${list.id}`, wordIds: Array.isArray(list.wordIds) ? list.wordIds : [] }))
    : [];

  return [...hsk, ...added, ...days, ...ownLists];
}

function selectedEnhancedWordIds(panel) {
  const selected = new Set(
    [...panel.querySelectorAll('input[type="checkbox"]:checked')].map((input) => input.value),
  );
  const sources = enhancedExportSources().filter((source) => selected.has(source.id));
  return [...new Set(sources.flatMap((source) => source.wordIds))];
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function exportEnhancedSelection(panel) {
  const ids = selectedEnhancedWordIds(panel);
  const byId = new Map(allExportWords().map((word) => [word.id, word]));
  const selectedWords = ids.map((id) => byId.get(id)).filter(Boolean);
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

function updateEnhancedSummary(panel) {
  const count = panel.querySelector(".export-count");
  const button = panel.querySelector(".export-download");
  const checkedCount = panel.querySelectorAll('input[type="checkbox"]:checked').length;
  const uniqueCount = selectedEnhancedWordIds(panel).length;
  if (count) {
    count.textContent = checkedCount
      ? `${checkedCount} selecties · ${uniqueCount} unieke woorden`
      : "Selecteer minstens één bron";
  }
  if (button) button.disabled = uniqueCount === 0;
}

function makeSourceLabel(source) {
  const label = document.createElement("label");
  label.dataset.enhancedExportSource = source.id;

  const input = document.createElement("input");
  input.type = "checkbox";
  input.value = source.id;

  const text = document.createElement("span");
  const strong = document.createElement("strong");
  strong.textContent = source.label;
  const small = document.createElement("small");
  small.textContent = `${source.kind} · ${source.wordIds.length} woorden`;
  text.append(strong, small);
  label.append(input, text);
  return label;
}

function patchExportPanel() {
  const panel = document.querySelector(".word-export-panel");
  if (!panel) return;
  const sourceList = panel.querySelector(".export-source-list");
  if (!sourceList) return;

  const summaryText = panel.querySelector("summary span");
  if (summaryText) summaryText.textContent = "HSK + lijsten + (+) woorden";
  const intro = panel.querySelector(".export-intro");
  if (intro) {
    intro.textContent = "Vink HSK-niveaus, gegenereerde daglijsten, eigen lijsten en/of je eigen toegevoegde (+)-woorden aan. Dubbele woorden worden automatisch samengevoegd.";
  }

  const extraSources = enhancedExportSources().filter((source) => source.id.startsWith("hsk:") || source.id === "custom:added");
  extraSources.forEach((source) => {
    if (sourceList.querySelector(`[data-enhanced-export-source="${source.id}"]`)) return;
    sourceList.prepend(makeSourceLabel(source));
  });

  if (!panel.dataset.enhancedExportHandlers) {
    panel.dataset.enhancedExportHandlers = "1";

    panel.addEventListener("change", () => {
      queueMicrotask(() => updateEnhancedSummary(panel));
    });

    panel.addEventListener("click", (event) => {
      const button = event.target.closest?.(".export-download");
      if (button) {
        event.preventDefault();
        event.stopImmediatePropagation();
        exportEnhancedSelection(panel);
        return;
      }
      if (event.target.closest?.(".export-toolbar")) {
        queueMicrotask(() => updateEnhancedSummary(panel));
      }
    }, true);
  }

  updateEnhancedSummary(panel);
}

let exportPatchScheduled = false;
function scheduleExportPatch() {
  if (exportPatchScheduled) return;
  exportPatchScheduled = true;
  requestAnimationFrame(() => {
    exportPatchScheduled = false;
    patchExportPanel();
  });
}

const exportObserver = new MutationObserver(scheduleExportPatch);
exportObserver.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["disabled"] });
window.addEventListener("chinees:words-ready", scheduleExportPatch);
document.addEventListener("DOMContentLoaded", scheduleExportPatch);
scheduleExportPatch();
