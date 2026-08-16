function settingsBlockTitle(block, index) {
  if (block.classList.contains("settings-export-panel")) return "Export";

  const heading = block.querySelector("h2, h3, .section-heading strong, .section-heading h2");
  const text = heading?.textContent?.trim();
  if (text) return text;

  const eyebrow = block.querySelector(".eyebrow")?.textContent?.trim();
  if (eyebrow) return eyebrow;

  return `Instellingen ${index + 1}`;
}

function makeCollapsible(block, index) {
  if (!block || block.closest(".settings-collapsible")) return;

  const details = document.createElement("details");
  details.className = "settings-collapsible";
  details.open = false;

  const summary = document.createElement("summary");
  summary.innerHTML = `<span></span><b aria-hidden="true">⌄</b>`;
  summary.querySelector("span").textContent = settingsBlockTitle(block, index);

  block.before(details);
  details.append(summary, block);
}

function installSettingsCollapsibles() {
  const page = document.querySelector(".settings-page");
  if (!page) return;

  const blocks = [...page.children].filter((child) =>
    child.matches?.(".settings-card, .settings-export-panel")
  );

  blocks.forEach((block, index) => makeCollapsible(block, index));
}

let scheduled = false;
function scheduleSettingsCollapsibles() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    installSettingsCollapsibles();
  });
}

new MutationObserver(scheduleSettingsCollapsibles).observe(document.documentElement, {
  childList: true,
  subtree: true,
});

document.addEventListener("DOMContentLoaded", scheduleSettingsCollapsibles);
scheduleSettingsCollapsibles();
