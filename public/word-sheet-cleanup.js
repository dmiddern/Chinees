function isOwnWord(sheet) {
  try {
    const hanzi = sheet.querySelector('.sheet-hanzi')?.textContent?.trim();
    const pinyin = sheet.querySelector('.sheet-pinyin')?.textContent?.trim().toLocaleLowerCase();
    if (!hanzi) return false;

    const customWords = JSON.parse(localStorage.getItem('chinese-custom-words-v1') || '[]');
    if (!Array.isArray(customWords)) return false;

    return customWords.some((word) => (
      word?.hanzi?.trim() === hanzi
      && (!pinyin || word?.pinyin?.trim().toLocaleLowerCase() === pinyin)
    ));
  } catch {
    return false;
  }
}

function enhanceWordSheet() {
  const sheet = document.querySelector('.word-sheet');
  if (!sheet) return;

  sheet.querySelector('.skill-summary')?.remove();
  sheet.querySelector('.notes-field')?.remove();

  const levelChip = sheet.querySelector('.level-chip');
  if (levelChip && isOwnWord(sheet)) {
    levelChip.textContent = '⊕';
    levelChip.setAttribute('title', 'Eigen woord');
    levelChip.setAttribute('aria-label', 'Eigen woord');
  }

  const listen = sheet.querySelector('.audio-button');
  const write = [...sheet.querySelectorAll('button')].find((button) => button.textContent?.trim() === 'Oefen de schrijfwijze');
  if (!listen || !write) return;

  let actions = sheet.querySelector('.word-sheet-actions');
  if (!actions) {
    actions = document.createElement('div');
    actions.className = 'word-sheet-actions';
    listen.before(actions);
  }

  listen.classList.add('word-sheet-action');
  write.className = 'word-sheet-action';
  write.textContent = '✎ Schrijfwijze';
  actions.append(listen, write);
}

let scheduled = false;
function scheduleWordSheetEnhancement() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    enhanceWordSheet();
  });
}

new MutationObserver(scheduleWordSheetEnhancement).observe(document.documentElement, { childList: true, subtree: true });
document.addEventListener('DOMContentLoaded', scheduleWordSheetEnhancement);
scheduleWordSheetEnhancement();
