const STORAGE_KEY = "chinees.daily-sets.v1";

function loadSets() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function sortedEntries() {
  return Object.entries(loadSets()).sort(([, a], [, b]) => (b?.createdAt || 0) - (a?.createdAt || 0));
}

function installStyles() {
  if (document.getElementById("daily-swipe-delete-css")) return;
  const style = document.createElement("style");
  style.id = "daily-swipe-delete-css";
  style.textContent = `
    .daily-history-row{position:relative;overflow:hidden;touch-action:pan-y}
    .daily-history-row>.daily-swipe-delete{position:absolute;inset:0 0 0 auto;width:76px;border:0;background:#a54438;color:#fff;display:grid;place-items:center;font-size:23px;cursor:pointer;z-index:0}
    .daily-history-row>.daily-day-select,.daily-history-row>.daily-day-open{position:relative;z-index:1;transition:transform .18s ease;background:var(--background)}
    .daily-history-row.daily-swipe-open>.daily-day-select,.daily-history-row.daily-swipe-open>.daily-day-open{transform:translateX(-76px)}
  `;
  document.head.append(style);
}

function closeOthers(except) {
  document.querySelectorAll(".daily-history-row.daily-swipe-open").forEach((row) => {
    if (row !== except) row.classList.remove("daily-swipe-open");
  });
}

function wireRow(row, storageKey) {
  if (row.dataset.swipeDeleteReady === "1") return;
  row.dataset.swipeDeleteReady = "1";

  const trash = document.createElement("button");
  trash.type = "button";
  trash.className = "daily-swipe-delete";
  trash.setAttribute("aria-label", "Verwijder deze lijst");
  trash.title = "Verwijder lijst";
  trash.textContent = "🗑";
  row.prepend(trash);

  let startX = 0;
  let startY = 0;
  let tracking = false;

  row.addEventListener("touchstart", (event) => {
    const touch = event.touches[0];
    if (!touch) return;
    startX = touch.clientX;
    startY = touch.clientY;
    tracking = true;
  }, { passive: true });

  row.addEventListener("touchend", (event) => {
    if (!tracking) return;
    tracking = false;
    const touch = event.changedTouches[0];
    if (!touch) return;
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;
    if (Math.abs(dx) < 34 || Math.abs(dx) < Math.abs(dy) * 1.25) return;

    if (dx < 0) {
      closeOthers(row);
      row.classList.add("daily-swipe-open");
    } else {
      row.classList.remove("daily-swipe-open");
    }
  }, { passive: true });

  trash.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const sets = loadSets();
    if (!(storageKey in sets)) return;
    delete sets[storageKey];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
    window.location.reload();
  });
}

function enhanceRows() {
  installStyles();
  const rows = [...document.querySelectorAll(".daily-history-list .daily-history-row")];
  if (!rows.length) return;
  const entries = sortedEntries();
  rows.forEach((row, index) => {
    const storageKey = entries[index]?.[0];
    if (storageKey) wireRow(row, storageKey);
  });
}

let scheduled = false;
function schedule() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    enhanceRows();
  });
}

new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element) || target.closest(".daily-history-row")) return;
  closeOthers(null);
});
document.addEventListener("DOMContentLoaded", schedule);
schedule();
