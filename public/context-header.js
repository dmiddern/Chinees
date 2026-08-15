const headerMap = {
  home: { title: "Leren", icon: "学" },
  learn: { title: "Leren", icon: "学" },
  guide: { title: "Theorie", icon: "文" },
  words: { title: "Woorden", icon: "词" },
  lists: { title: "Lijsten", icon: "☷" },
  write: { title: "Schrijven", icon: "写" },
  settings: { title: "Instellingen", icon: "⚙" },
};

function activeTab() {
  const activeNav = document.querySelector('.bottom-nav button[aria-current="page"]');
  if (activeNav) {
    const label = activeNav.textContent?.trim().toLowerCase();
    if (label?.includes("leren")) return "home";
    if (label?.includes("theorie")) return "guide";
    if (label?.includes("woorden")) return "words";
    if (label?.includes("lijsten")) return "lists";
    if (label?.includes("schrijven")) return "write";
    if (label?.includes("instellingen")) return "settings";
  }

  if (document.querySelector('.learn-page, .daily-complete')) return "learn";
  if (document.querySelector('.article-guide, .article-reader')) return "guide";
  if (document.querySelector('.words-page')) return "words";
  if (document.querySelector('.lists-page')) return "lists";
  if (document.querySelector('.writing-page')) return "write";
  if (document.querySelector('.settings-page')) return "settings";
  return "home";
}

function updateHeader() {
  const brand = document.querySelector('.topbar .brand');
  if (!brand) return;

  const config = headerMap[activeTab()] || headerMap.home;
  const mark = brand.querySelector('.brand-mark');
  const strong = brand.querySelector('strong');
  const small = brand.querySelector('small');

  if (mark && mark.textContent !== config.icon) mark.textContent = config.icon;
  if (strong && strong.textContent !== config.title) strong.textContent = config.title;
  if (small) small.remove();
}

let scheduled = false;
function scheduleHeaderUpdate() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    updateHeader();
  });
}

new MutationObserver(scheduleHeaderUpdate).observe(document.documentElement, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ["class", "aria-current"],
});

document.addEventListener("click", () => requestAnimationFrame(scheduleHeaderUpdate), true);
document.addEventListener("DOMContentLoaded", scheduleHeaderUpdate);
scheduleHeaderUpdate();
