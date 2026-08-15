function enhanceWordSheet() {
  const sheet = document.querySelector('.word-sheet');
  if (!sheet) return;

  sheet.querySelector('.skill-summary')?.remove();
  sheet.querySelector('.notes-field')?.remove();

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
