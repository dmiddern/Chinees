declare global {
  interface Window {
    __practiceExitInstalled?: boolean;
  }
}

const STYLE_ID = "practice-exit-style";

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
.practice-exit-button{
  position:sticky;
  top:calc(env(safe-area-inset-top, 0px) + 8px);
  z-index:20;
  width:42px;
  height:42px;
  margin:0 0 10px;
  border:1px solid var(--line,#ddd8d2);
  border-radius:50%;
  background:var(--paper,#fffdfa);
  color:var(--ink,#373534);
  display:grid;
  place-items:center;
  font:inherit;
  font-size:24px;
  line-height:1;
  box-shadow:0 4px 14px rgba(0,0,0,.08);
  cursor:pointer;
}
`;
  document.head.append(style);
}

function goBackToLearning() {
  const buttons = [...document.querySelectorAll<HTMLButtonElement>(".bottom-nav button")];
  const learningButton = buttons.find((button) => button.textContent?.includes("Leren")) || buttons[0];
  learningButton?.click();
}

function enhancePracticeExit() {
  const page = document.querySelector<HTMLElement>(".learn-page");
  if (!page || page.querySelector(".practice-exit-button")) return;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "practice-exit-button";
  button.textContent = "‹";
  button.setAttribute("aria-label", "Oefensessie verlaten");
  button.title = "Terug";
  button.addEventListener("click", goBackToLearning);
  page.prepend(button);
}

export function installPracticeExit() {
  if (window.__practiceExitInstalled) return;
  window.__practiceExitInstalled = true;
  ensureStyles();

  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      enhancePracticeExit();
    });
  };

  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  enhancePracticeExit();
}
