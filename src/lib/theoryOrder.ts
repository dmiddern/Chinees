declare global {
  interface Window {
    __theoryOrderInstalled?: boolean;
  }
}

function keepStudiedTopicsOnTop() {
  const guide = document.querySelector(".article-guide");
  const studied = guide?.querySelector(".studied-topics");
  const routeHeading = guide?.querySelector(".article-section-heading");

  if (!guide || !studied || !routeHeading) return;
  if (studied.nextElementSibling === routeHeading) return;

  guide.insertBefore(studied, routeHeading);
}

export function installTheoryOrder() {
  if (window.__theoryOrderInstalled) return;
  window.__theoryOrderInstalled = true;

  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      keepStudiedTopicsOnTop();
    });
  };

  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  schedule();
}
