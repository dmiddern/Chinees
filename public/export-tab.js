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
    };
  }).filter(Boolean).sort((a, b) => b.id.localeCompare(a.id));

  const ownLists = Array.isArray(lists) ? lists.map((list) => ({
    id: `list:${list.id}`,
    label: list.name || "Naamloze lijst",
    detail: `${Array.isArray(list.wordIds) ? list.wordIds.length : 0} woorden`,
    wordIds: Array.isArray(list.wordIds) ? list.wordIds : [],
  })) : [];

  const ownWords = custom.length ? [{
    id: "custom:words",
    label: "Eigen woorden (+)",
    detail: `${custom.length} woorden`,
    wordIds: custom.map((word) => word.id),
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

function selectedIds(page) {
  const sources = new Map(exportGroups().flatMap((group) => group.items.map((item) => [item.id, item])));
  const selected = [...page.querySelectorAll('input[type="checkbox"]:checked')]
    .map((input) => sources.get(input.value))
    .filter(Boolean);
  return [...new Set(selected.flatMap((item) => item.wordIds))];
}

function updateSummary(page) {
  const ids = selectedIds(page);
  const checked = page.querySelectorAll('input[type="checkbox"]:checked').length;
  const summary = page.querySelector(".standalone-export-summary");
  const button = page.querySelector(".standalone-export-download");
  if (summary) summary.textContent = checked ? `${checked} selecties · ${ids.length} unieke woorden` : "Nog niets geselecteerd";
  if (button) button.disabled = ids.length === 0;
}

function downloadSelection(page) {
  const ids = selectedIds(page);
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
  label.innerHTML = `<input type="checkbox" value="${item.id}"><span><strong></strong><small></small></span>`;
  label.querySelector("strong").textContent = item.label;
  label.querySelector("small").textContent = item.detail;
  return label;
}

function renderExportPage() {
  const main = document.querySelector("main");
  if (!main) return null;
  main.querySelector(".standalone-export-page")?.remove();

  const page = document.createElement("div");
  page.className = "page standalone-export-page";

  const groups = exportGroups();
  const sections = groups.map((group) => {
    const section = document.createElement("section");
    section.className = "standalone-export-group";
    const heading = document.createElement("h2");
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
    return section;
  });

  const intro = document.createElement("div");
  intro.className = "standalone-export-intro";
  intro.innerHTML = `<h1>Export</h1><p>Selecteer wat je wilt meenemen. Dubbele woorden worden automatisch samengevoegd.</p>`;

  const footer = document.createElement("div");
  footer.className = "standalone-export-footer";
  footer.innerHTML = `<span class="standalone-export-summary">Nog niets geselecteerd</span><button class="button primary-button standalone-export-download" disabled>Exporteer CSV</button>`;

  page.append(intro, ...sections, footer);
  page.addEventListener("change", () => updateSummary(page));
  page.querySelector(".standalone-export-download").addEventListener("click", () => downloadSelection(page));
  main.append(page);
  return page;
}

function setExportHeader() {
  const brand = document.querySelector(".topbar .brand");
  if (!brand) return;
  const mark = brand.querySelector(".brand-mark");
  const strong = brand.querySelector("strong");
  const small = brand.querySelector("small");
  if (mark) mark.textContent = "出";
  if (strong) strong.textContent = "Export";
  if (small) small.style.display = "none";
}

function leaveExportMode() {
  if (!document.body.classList.contains("export-tab-active")) return;
  document.body.classList.remove("export-tab-active");
  document.querySelector(".standalone-export-page")?.remove();
  document.querySelector(".standalone-export-nav")?.classList.remove("active");
}

function openExportMode() {
  document.body.classList.add("export-tab-active");
  renderExportPage();
  document.querySelectorAll(".bottom-nav button").forEach((button) => button.classList.remove("active"));
  document.querySelector(".standalone-export-nav")?.classList.add("active");
  setExportHeader();
  window.scrollTo({ top: 0, behavior: "instant" });
}

function installExportTab() {
  const nav = document.querySelector(".bottom-nav");
  if (!nav || nav.querySelector(".standalone-export-nav")) return;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "standalone-export-nav";
  button.innerHTML = `<span aria-hidden="true">⇩</span>Export`;
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    openExportMode();
  });
  nav.append(button);

  [...nav.querySelectorAll("button:not(.standalone-export-nav)")].forEach((nativeButton) => {
    nativeButton.addEventListener("click", leaveExportMode, true);
  });
}

let exportTabScheduled = false;
function scheduleExportTab() {
  if (exportTabScheduled) return;
  exportTabScheduled = true;
  requestAnimationFrame(() => {
    exportTabScheduled = false;
    installExportTab();
    if (document.body.classList.contains("export-tab-active")) setExportHeader();
  });
}

new MutationObserver(scheduleExportTab).observe(document.documentElement, { childList: true, subtree: true });
window.addEventListener("chinees:words-ready", scheduleExportTab);
document.addEventListener("DOMContentLoaded", scheduleExportTab);
scheduleExportTab();
