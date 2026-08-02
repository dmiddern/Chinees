import { readFileSync, writeFileSync } from "node:fs";

const file = "src/App.tsx";
let source = readFileSync(file, "utf8");

function replaceOnce(before, after, label) {
  if (source.includes(after)) return;
  if (!source.includes(before)) throw new Error(`Patchdoel ontbreekt: ${label}`);
  source = source.replace(before, after);
}

replaceOnce(
  `interface Settings {\n  levels: HskLevel[];\n  direction: Direction;\n  speechRate: number;\n}`,
  `interface Settings {\n  levels: HskLevel[];\n  direction: Direction;\n  speechRate: number;\n  pauseDailyLists: boolean;\n}`,
  "instellingen-type",
);

replaceOnce(
  `const defaultSettings: Settings = {\n  levels: [1],\n  direction: "zh-nl",\n  speechRate: 0.72,\n};`,
  `const defaultSettings: Settings = {\n  levels: [1],\n  direction: "zh-nl",\n  speechRate: 0.72,\n  pauseDailyLists: false,\n};`,
  "standaardinstellingen",
);

replaceOnce(
  `  useEffect(() => {\n    setDailySets((current) => createDailySet(current, levelWords, settings.levels, DAILY_WORD_COUNT, progress));\n  }, [levelWords, progress, settings.levels]);`,
  `  useEffect(() => {\n    if (settings.pauseDailyLists) return;\n    setDailySets((current) => createDailySet(current, levelWords, settings.levels, DAILY_WORD_COUNT, progress));\n  }, [levelWords, progress, settings.levels, settings.pauseDailyLists]);`,
  "daglijstgeneratie",
);

replaceOnce(
  `      <section className="settings-card">\n        <label>\n          <span><strong>Uitspraaksnelheid</strong><small>{Math.round(settings.speechRate * 100)}%</small></span>\n          <input type="range" min="0.5" max="1" step="0.05" value={settings.speechRate} onChange={(event) => onChange({ speechRate: Number(event.target.value) })} />\n        </label>\n      </section>`,
  `      <section className="settings-card">\n        <label>\n          <span><strong>Uitspraaksnelheid</strong><small>{Math.round(settings.speechRate * 100)}%</small></span>\n          <input type="range" min="0.5" max="1" step="0.05" value={settings.speechRate} onChange={(event) => onChange({ speechRate: Number(event.target.value) })} />\n        </label>\n      </section>\n      <section className="settings-card">\n        <label>\n          <span>\n            <strong>Dagelijkse lijsten pauzeren</strong>\n            <small>Bestaande daglijsten en leerresultaten blijven behouden.</small>\n          </span>\n          <input\n            type="checkbox"\n            checked={settings.pauseDailyLists}\n            onChange={(event) => onChange({ pauseDailyLists: event.target.checked })}\n          />\n        </label>\n      </section>`,
  "pauzeknop",
);

writeFileSync(file, source);
console.log("Pauze-instelling voor dagelijkse lijsten gecontroleerd en toegepast.");
