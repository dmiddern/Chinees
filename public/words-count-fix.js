const countsByFilter = new Map();

function activeFilterKey(page) {
  const active = [...page.querySelectorAll('.filter-chips button')]
    .find((button) => button.classList.contains('active'));
  return active?.textContent?.trim() || 'Alles';
}

function currentResultCount(page) {
  const text = page.querySelector('.result-count')?.textContent || '';
  const match = text.replace(/\./g, '').match(/\d+/);
  return match ? Number(match[0]) : null;
}

function formatCount(count) {
  return `${count.toLocaleString('nl-BE')} woorden`;
}

function updateWordsHeading() {
  const page = document.querySelector('.words-page');
  if (!page) return;

  const heading = page.querySelector('.page-title-row h1');
  const input = page.querySelector('.search-box input');
  if (!heading || !input) return;

  const key = activeFilterKey(page);
  const count = currentResultCount(page);

  // Bewaar het echte aantal voor een filter alleen wanneer er niet gezocht wordt.
  // Zo verandert de titel niet mee met tijdelijke zoekresultaten.
  if (!input.value.trim() && count !== null) {
    countsByFilter.set(key, count);
  }

  const filterCount = countsByFilter.get(key);
  if (filterCount === undefined) return;

  const next = formatCount(filterCount);
  if (heading.textContent !== next) heading.textContent = next;
}

let scheduled = false;
function scheduleUpdate() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    updateWordsHeading();
  });
}

document.addEventListener('click', (event) => {
  if (event.target.closest('.words-page .filter-chips button')) {
    requestAnimationFrame(scheduleUpdate);
  }
}, true);

document.addEventListener('input', (event) => {
  if (event.target.matches?.('.words-page .search-box input')) scheduleUpdate();
}, true);

new MutationObserver(scheduleUpdate).observe(document.documentElement, { childList: true, subtree: true });
document.addEventListener('DOMContentLoaded', scheduleUpdate);
scheduleUpdate();
