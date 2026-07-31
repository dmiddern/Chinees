import { readFileSync, writeFileSync } from "node:fs";

const file = "src/App.tsx";
let source = readFileSync(file, "utf8");

function replaceOnce(before, after, label) {
  if (source.includes(after)) return;
  if (!source.includes(before)) throw new Error(`Patchdoel ontbreekt: ${label}`);
  source = source.replace(before, after);
}

replaceOnce(
  `          <Home\n            stats={stats}\n            settings={settings}\n            todayWords={todayWords}\n            todayCompleted={todayCompleted}\n            history={dailyHistory}\n            onStart={startToday}\n            onPracticeDays={startDailySetReview}\n            onWrite={() => setTab("write")}\n            onToggleLevel={toggleLevel}\n            onOpenDay={setSelectedDay}\n          />`,
  `          <Home\n            stats={stats}\n            todayWords={todayWords}\n            todayCompleted={todayCompleted}\n            history={dailyHistory}\n            onStart={startToday}\n            onPracticeDays={startDailySetReview}\n            onWrite={() => setTab("write")}\n            onOpenDay={setSelectedDay}\n          />`,
  "Home-aanroep",
);

replaceOnce(
  `          <WordList\n            progress={progress}\n            lists={customLists}`,
  `          <WordList\n            progress={progress}\n            lists={customLists}\n            activeLevels={settings.levels}`,
  "WordList-aanroep",
);

replaceOnce(
  `function Home({\n  stats,\n  settings,\n  todayWords,\n  todayCompleted,\n  history,\n  onStart,\n  onPracticeDays,\n  onWrite,\n  onToggleLevel,\n  onOpenDay,\n}: {\n  stats: { total: number; known: number; learning: number; newCount: number; reviews: number };\n  settings: Settings;\n  todayWords: Word[];\n  todayCompleted: number;\n  history: DailySet[];\n  onStart: (direction: Direction) => void;\n  onPracticeDays: (sets: DailySet[], direction: Direction) => void;\n  onWrite: () => void;\n  onToggleLevel: (level: HskLevel) => void;\n  onOpenDay: (set: DailySet) => void;\n}) {`,
  `function Home({\n  stats,\n  todayWords,\n  todayCompleted,\n  history,\n  onStart,\n  onPracticeDays,\n  onWrite,\n  onOpenDay,\n}: {\n  stats: { total: number; known: number; learning: number; newCount: number; reviews: number };\n  todayWords: Word[];\n  todayCompleted: number;\n  history: DailySet[];\n  onStart: (direction: Direction) => void;\n  onPracticeDays: (sets: DailySet[], direction: Direction) => void;\n  onWrite: () => void;\n  onOpenDay: (set: DailySet) => void;\n}) {`,
  "Home-props",
);

const homeLevels = `      <section className="level-selector" aria-label="Actieve niveaus">\n        {hskLevels.map((level) => (\n          <button\n            key={level}\n            className={settings.levels.includes(level as HskLevel) ? "active" : ""}\n            onClick={() => onToggleLevel(level as HskLevel)}\n          >\n            HSK {level}\n          </button>\n        ))}\n      </section>\n\n`;
if (source.includes(homeLevels)) source = source.replace(homeLevels, "");

replaceOnce(
  `  function restart() {\n    if (!session) return;\n    onSessionChange(createLearningSession(session.date, session.wordIds, session.title, session.direction));\n  }\n`,
  `  function restart() {\n    if (!session) return;\n    onSessionChange(createLearningSession(session.date, session.wordIds, session.title, session.direction));\n  }\n\n  function switchDirection(direction: Direction) {\n    if (!session || session.direction === direction) return;\n    onSessionChange(createLearningSession(session.date, session.wordIds, session.title, direction));\n  }\n`,
  "richtingswissel",
);

replaceOnce(
  `      <div className="direction-indicator" aria-label="Vertaalrichting van deze oefening">\n        <span className={exercise.direction === "zh-nl" ? "active" : ""}>\n          Chinees → {meaningLanguageLabel}\n        </span>\n        <span className={exercise.direction === "nl-zh" ? "active" : ""}>\n          {meaningLanguageLabel} → Chinees\n        </span>\n      </div>`,
  `      <div className="direction-indicator" aria-label="Vertaalrichting van deze oefening">\n        <button type="button" className={exercise.direction === "zh-nl" ? "active" : ""} onClick={() => switchDirection("zh-nl")} aria-pressed={exercise.direction === "zh-nl"}>\n          Chinees → {meaningLanguageLabel}\n        </button>\n        <button type="button" className={exercise.direction === "nl-zh" ? "active" : ""} onClick={() => switchDirection("nl-zh")} aria-pressed={exercise.direction === "nl-zh"}>\n          {meaningLanguageLabel} → Chinees\n        </button>\n      </div>`,
  "richtingsknoppen",
);

replaceOnce(
  `function WordList({\n  progress,\n  lists,\n  onSelect,`,
  `function WordList({\n  progress,\n  lists,\n  activeLevels,\n  onSelect,`,
  "WordList-destructuring",
);

replaceOnce(
  `  progress: ProgressMap;\n  lists: CustomWordList[];\n  onSelect: (word: Word) => void;`,
  `  progress: ProgressMap;\n  lists: CustomWordList[];\n  activeLevels: HskLevel[];\n  onSelect: (word: Word) => void;`,
  "WordList-type",
);

replaceOnce(
  `  const [query, setQuery] = useState("");\n  const [level, setLevel] = useState<"all" | HskLevel>("all");\n  const [newListName, setNewListName] = useState("");`,
  `  const [query, setQuery] = useState("");\n  const [extraLevels, setExtraLevels] = useState<HskLevel[]>([]);\n  const [newListName, setNewListName] = useState("");`,
  "zoekfilter-state",
);

replaceOnce(
  `  const selectedList = lists.find((list) => list.id === selectedListId);\n  const filtered = useMemo(\n    () => searchWords(words.filter((word) => (\n      (level === "all" || word.level === level)\n      && (!onlySelectedList || !selectedList || selectedList.wordIds.includes(word.id))\n    )), query),\n    [query, level, onlySelectedList, selectedList],\n  );`,
  `  const selectedList = lists.find((list) => list.id === selectedListId);\n  const selectedLevels = useMemo(\n    () => hskLevels.filter((level) => activeLevels.includes(level) || extraLevels.includes(level)),\n    [activeLevels, extraLevels],\n  );\n  const filtered = useMemo(\n    () => searchWords(words.filter((word) => (\n      selectedLevels.includes(word.level)\n      && (!onlySelectedList || !selectedList || selectedList.wordIds.includes(word.id))\n    )), query),\n    [query, selectedLevels, onlySelectedList, selectedList],\n  );\n\n  function toggleExtraLevel(level: HskLevel) {\n    if (activeLevels.includes(level)) return;\n    setExtraLevels((current) => current.includes(level)\n      ? current.filter((item) => item !== level)\n      : [...current, level]);\n  }`,
  "zoekfilter-logica",
);

replaceOnce(
  `      <div className="filter-chips">\n        {(["all", ...hskLevels] as const).map((item) => (\n          <button className={level === item ? "active" : ""} key={item} onClick={() => setLevel(item)}>\n            {item === "all" ? "Alles" : \`HSK \${item}\`}\n          </button>\n        ))}\n      </div>`,
  `      <div className="word-level-filter">\n        <div className="section-heading compact-heading">\n          <div>\n            <span>HSK-niveaus</span>\n            <small>Je ingestelde niveaus zijn standaard geselecteerd. Duid hier tijdelijk extra niveaus aan.</small>\n          </div>\n          {extraLevels.length > 0 && <button onClick={() => setExtraLevels([])}>Alleen standaard</button>}\n        </div>\n        <div className="filter-chips">\n          {hskLevels.map((item) => {\n            const isDefault = activeLevels.includes(item);\n            const isActive = isDefault || extraLevels.includes(item);\n            return (\n              <button className={isActive ? "active" : ""} key={item} onClick={() => toggleExtraLevel(item)} aria-pressed={isActive} title={isDefault ? "Geselecteerd via Instellingen" : undefined}>\n                HSK {item}{isDefault ? " · standaard" : ""}\n              </button>\n            );\n          })}\n        </div>\n      </div>`,
  "HSK-zoekknoppen",
);

writeFileSync(file, source);
console.log("Learning UI patch gecontroleerd en toegepast.");
