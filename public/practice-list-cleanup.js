const LEARNING_SESSION_KEY = "chinees.learning-session.v1";

function hasActiveExercise() {
  try {
    const session = JSON.parse(localStorage.getItem(LEARNING_SESSION_KEY) || "null");
    if (!session || !Array.isArray(session.queue)) return false;
    const exercise = session.queue[session.index];
    return Number.isFinite(exercise?.wordId);
  } catch {
    return false;
  }
}

function cleanupPracticeListAdder() {
  const learnPage = document.querySelector(".learn-page");
  const shouldShow = Boolean(learnPage && hasActiveExercise());

  if (!shouldShow) {
    document.querySelectorAll(".practice-list-adder").forEach((element) => element.remove());
  }
}

let scheduled = false;
function scheduleCleanup() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    cleanupPracticeListAdder();
  });
}

new MutationObserver(scheduleCleanup).observe(document.documentElement, { childList: true, subtree: true });
window.addEventListener("storage", scheduleCleanup);
document.addEventListener("DOMContentLoaded", scheduleCleanup);
scheduleCleanup();
