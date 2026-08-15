import { loadHanziPracticeSettings, updateHanziPracticeSetting, type HanziPracticeSettings } from "./hanziPracticeSettings";

type FieldConfig = {
  key: keyof HanziPracticeSettings;
  label: string;
  type: "number" | "toggle";
  min?: number;
  max?: number;
  step?: number;
  zeroMeansOff?: boolean;
};

const fields: FieldConfig[] = [
  { key: "leniency", label: "Leniency", type: "number", min: 0.1, max: 3, step: 0.05 },
  { key: "showHintAfterMisses", label: "Hint na fouten", type: "number", min: 0, max: 20, step: 1, zeroMeansOff: true },
  { key: "markStrokeCorrectAfterMisses", label: "Automatisch goed na fouten", type: "number", min: 0, max: 20, step: 1, zeroMeansOff: true },
  { key: "quizStartStrokeNum", label: "Start bij streek", type: "number", min: 0, max: 50, step: 1 },
  { key: "acceptBackwardsStrokes", label: "Omgekeerde streken", type: "toggle" },
  { key: "highlightOnComplete", label: "Markeer bij voltooiing", type: "toggle" },
  { key: "showOutline", label: "Omtrek tonen", type: "toggle" },
  { key: "showCharacter", label: "Karakter tonen", type: "toggle" },
  { key: "strokeAnimationSpeed", label: "Animatiesnelheid", type: "number", min: 0.1, max: 5, step: 0.1 },
  { key: "strokeHighlightSpeed", label: "Hintsnelheid", type: "number", min: 0.1, max: 5, step: 0.1 },
  { key: "strokeFadeDuration", label: "Fade (ms)", type: "number", min: 0, max: 3000, step: 50 },
  { key: "delayBetweenStrokes", label: "Pauze tussen streken (ms)", type: "number", min: 0, max: 3000, step: 50 },
  { key: "delayBetweenLoops", label: "Pauze tussen lussen (ms)", type: "number", min: 0, max: 5000, step: 100 },
  { key: "drawingWidth", label: "Tekendikte", type: "number", min: 1, max: 20, step: 1 },
];

function buildCard() {
  const settings = loadHanziPracticeSettings();
  const section = document.createElement("section");
  section.className = "settings-card hanzi-params-card";
  section.dataset.hanziParams = "true";

  const title = document.createElement("h2");
  title.textContent = "Hanzi practice";
  section.append(title);

  const grid = document.createElement("div");
  grid.className = "hanzi-param-grid";

  fields.forEach((field) => {
    const row = document.createElement("label");
    row.className = "hanzi-param-row";

    const text = document.createElement("span");
    const strong = document.createElement("strong");
    strong.textContent = field.label;
    const code = document.createElement("small");
    code.textContent = field.key;
    text.append(strong, code);

    if (field.type === "toggle") {
      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = Boolean(settings[field.key]);
      input.onchange = () => updateHanziPracticeSetting(field.key as keyof HanziPracticeSettings, input.checked as never);
      row.append(text, input);
    } else {
      const input = document.createElement("input");
      input.type = "number";
      if (field.min !== undefined) input.min = String(field.min);
      if (field.max !== undefined) input.max = String(field.max);
      if (field.step !== undefined) input.step = String(field.step);
      const current = settings[field.key];
      input.value = String(current === false ? 0 : current);
      input.onchange = () => {
        const numeric = Number(input.value);
        const value = field.zeroMeansOff && numeric === 0 ? false : numeric;
        updateHanziPracticeSetting(field.key as keyof HanziPracticeSettings, value as never);
      };
      row.append(text, input);
    }

    grid.append(row);
  });

  section.append(grid);
  return section;
}

function enhanceSettings() {
  const page = document.querySelector(".settings-page");
  if (!page) return;

  page.querySelectorAll(".settings-card").forEach((card) => {
    const heading = card.querySelector("h2")?.textContent?.trim();
    if (heading === "Tekennauwkeurigheid") card.remove();
  });

  if (page.querySelector("[data-hanzi-params='true']")) return;
  const speechCard = [...page.querySelectorAll(":scope > .settings-card")]
    .find((card) => card.textContent?.includes("Uitspraaksnelheid"));
  const card = buildCard();
  if (speechCard?.nextSibling) page.insertBefore(card, speechCard.nextSibling);
  else page.append(card);
}

export function installHanziSettingsUi() {
  let scheduled = false;
  const run = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      enhanceSettings();
    });
  };
  new MutationObserver(run).observe(document.body, { childList: true, subtree: true });
  run();
}
