const SETTINGS_KEY = "chinees.settings.v1";

function readEnabled() {
  try {
    const settings = JSON.parse(window.localStorage.getItem(SETTINGS_KEY) || "{}") as { includeCustomDailyWords?: boolean };
    return settings.includeCustomDailyWords === true;
  } catch {
    return false;
  }
}

function writeEnabled(enabled: boolean) {
  try {
    const settings = JSON.parse(window.localStorage.getItem(SETTINGS_KEY) || "{}") as Record<string, unknown>;
    settings.includeCustomDailyWords = enabled;
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify({ includeCustomDailyWords: enabled }));
  }
}

function installToggle() {
  const selector = document.querySelector<HTMLElement>(".settings-page .settings-card .level-selector.left");
  if (!selector || selector.querySelector(".custom-daily-source-toggle")) return;

  const button = document.createElement("button");
  button.type = "button";
  button.className = `custom-daily-source-toggle${readEnabled() ? " active" : ""}`;
  button.textContent = "⊕ Eigen woorden";
  button.title = "Gebruik eigen woorden ook voor automatisch gegenereerde daglijsten";
  button.setAttribute("aria-pressed", String(readEnabled()));
  button.addEventListener("click", () => {
    const enabled = !readEnabled();
    writeEnabled(enabled);
    button.classList.toggle("active", enabled);
    button.setAttribute("aria-pressed", String(enabled));
  });

  selector.appendChild(button);
}

export function installCustomDailySourceToggle() {
  installToggle();
  const observer = new MutationObserver(() => installToggle());
  observer.observe(document.body, { childList: true, subtree: true });
}
