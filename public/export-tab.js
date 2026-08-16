const EXPORT_CUSTOM_WORDS_KEY = "chinese-custom-words-v1";
const EXPORT_CUSTOM_LISTS_KEY = "chinees.custom-lists.v1";
const EXPORT_DAILY_SETS_KEY = "chinees.daily-sets.v1";
const EXPORT_HSK_LEVELS = [1, 2, 3, 4, 5, 6, "7-9"];

function readJson(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function allWords() {
  const builtIn = Array.isArray(window.__chineesWords) ? window.__chineesWords : [];
  const custom = readJson(EXPORT_CUSTOM_WORDS_KEY, []);
  const byId = new Map();
  [...builtIn, ...(Array.isArray(custom) ? custom : [])].forEach((word) => {
    if (word?.id != null) byId.set(word.id, word);
  });
  return [...byId.values()];
}

function exportGroups() {
  const words = allWords();
  const builtIn = words.filter((word) => !word.custom && word.source !== "custom");
  const custom = words.filter((word) => word.custom || word.source === "custom");
  const dailySets = readJson(EXPORT_DAILY_SETS_KEY, {});
  const lists = readJson(EXPORT_CUSTOM_LISTS_KEY, []);

  const hsk = EXPORT_HSK_LEVELS.map((level) => ({
    id: `hsk:${level}`,
    label: `HSK ${level}`,
    detail: `${builtIn.filter((word) => String(word.level) === String(level)).length} woorden`,
    wordIds: builtIn.filter((word) => String(word.level) === String(level)).map((word) => word.id),
    defaultSelected: false,
  })).filter((item) => item.wordIds.length);

  const days = Object.entries(dailySets || {}).map(([key, set]) => {
    if (!set?.date || !Array.isArray(set.wordIds)) return null;
    const date = new Intl.DateTimeFormat("nl-BE", { weekday: "short", day: "numeric", month: "short" })
      .format(new Date(`${set.date}T12:00:00`));
    const time = set.createdAt
      ? new Intl.DateTimeFormat("nl-BE", { hour: "2-digit", minute: "2-digit" }).format(new Date(set.createdAt))
      : "";
    return {
      id: `day:${key}`,
      label: `${date}${time ? ` · ${time}` : ""}`,
      detail: `${set.wordIds.length} woorden`,
      wordIds: set.wordIds,
      defaultSelected: true,
    };
  }).filter(Boolean).sort((a, b) => b.id.localeCompare(a.id));

  const ownLists = Array.isArray(lists) ? lists.map((list) => ({
    id: `list:${list.id}`,
    label: list.name || "Naamloze lijst",
    detail: `${Array.isArray(list.wordIds) ? list.wordIds.length : 0} woorden`,
    wordIds: Array.isArray(list.wordIds) ? list.wordIds : [],
    defaultSelected: true,
  })) : [];

  const ownWords = custom.length ? [{
    id: "custom:words",
    label: "Eigen woorden (+)",
    detail: `${custom.length} woorden`,
    wordIds: custom.map((word) => word.id),
    defaultSelected: true,
  }] : [];

  return [
    { title: "HSK-niveaus", items: hsk },
    { title: "Daglijsten", items: days },
    { title: "Eigen woordenlijsten", items: ownLists },
    { title: "Eigen woorden", items: ownWords },
  ];
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function selectedIds(panel) {
  const sources = new Map(exportGroups().flatMap((group) => group.items.map((item) => [item.id, item])));
  const selected = [...panel.querySelectorAll('input[type="checkbox"]:checked')]
    .map((input) => sources.get(input.value))
    .filter(Boolean);
  return [...new Set(selected.flatMap((item) => item.wordIds))];
}

function updateSummary(panel) {
  const ids = selectedIds(panel);
  const checked = panel.querySelectorAll('input[type="checkbox"]:checked').length;
  const summary = panel.querySelector(".standalone-export-summary");
  const button = panel.querySelector(".standalone-export-download");
  if (summary) summary.textContent = checked ? `${checked} selecties · ${ids.length} unieke woorden` : "Nog niets geselecteerd";
  if (button) button.disabled = ids.length === 0;
}

function downloadSelection(panel) {
  const ids = selectedIds(panel);
  const byId = new Map(allWords().map((word) => [word.id, word]));
  const rows = ids.map((id) => byId.get(id)).filter(Boolean);
  if (!rows.length) return;

  const lines = [
    ["Chinees", "Pinyin", "Vertaling"],
    ...rows.map((word) => [word.hanzi, word.pinyin, word.meaningNl]),
  ];
  const csv = `\uFEFF${lines.map((row) => row.map(csvCell).join(";")).join("\r\n")}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `chinees-export-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function sourceRow(item) {
  const label = document.createElement("label");
  label.className = "standalone-export-source";
  const checked = item.defaultSelected ? " checked" : "";
  label.innerHTML = `<input type="checkbox" value="${item.id}"${checked}><span><strong></strong><small></small></span>`;
  label.querySelector("strong").textContent = item.label;
  label.querySelector("small").textContent = item.detail;
  return label;
}

function buildExportPanel() {
  const panel = document.createElement("section");
  panel.className = "settings-export-panel";

  const intro = document.createElement("div");
  intro.className = "standalone-export-intro";
  intro.innerHTML = `<p class="eyebrow">Gegevens</p><h2>Export</h2><p>Selecteer wat je wilt meenemen. Dubbele woorden worden automatisch samengevoegd.</p>`;
  panel.append(intro);

  exportGroups().forEach((group) => {
    const section = document.createElement("section");
    section.className = "standalone-export-group";
    const heading = document.createElement("h3");
    heading.textContent = group.title;
    section.append(heading);
    if (!group.items.length) {
      const empty = document.createElement("p");
      empty.className = "standalone-export-empty";
      empty.textContent = "Geen items beschikbaar";
      section.append(empty);
    } else {
      group.items.forEach((item) => section.append(sourceRow(item)));
    }
    panel.append(section);
  });

  const footer = document.createElement("div");
  footer.className = "standalone-export-footer";
  footer.innerHTML = `<span class="standalone-export-summary"></span><button class="button primary-button standalone-export-download">Exporteer CSV</button>`;
  panel.append(footer);

  panel.addEventListener("change", () => updateSummary(panel));
  panel.querySelector(".standalone-export-download").addEventListener("click", () => downloadSelection(panel));
  updateSummary(panel);
  return panel;
}

function installExportInSettings() {
  document.querySelector(".standalone-export-nav")?.remove();
  document.body.classList.remove("export-tab-active");
  document.querySelector(".standalone-export-page")?.remove();

  const settingsPage = document.querySelector(".settings-page");
  if (!settingsPage) return;
  if (settingsPage.querySelector(".settings-export-panel")) return;
  settingsPage.append(buildExportPanel());
}

let scheduled = false;
function scheduleInstall() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    installExportInSettings();
  });
}

new MutationObserver(scheduleInstall).observe(document.documentElement, { childList: true, subtree: true });
window.addEventListener("chinees:words-ready", scheduleInstall);
document.addEventListener("DOMContentLoaded", scheduleInstall);
scheduleInstall();
