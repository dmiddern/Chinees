import { readFileSync, writeFileSync } from "node:fs";

const path = "src/App.tsx";
let text = readFileSync(path, "utf8");

const replacements = [
  [
`          <Home
            stats={stats}
            settings={settings}
            todayWords={todayWords}
            todayCompleted={todayCompleted}
            history={dailyHistory}
            onStart={startToday}
            onPracticeDays={startDailySetReview}
            onWrite={() => setTab("write")}
            onToggleLevel={toggleLevel}
            onOpenDay={setSelectedDay}
          />`,
`          <Home
            stats={stats}
            todayWords={todayWords}
            todayCompleted={todayCompleted}
            history={dailyHistory}
            onStart={startToday}
            onPracticeDays={startDailySetReview}
            onWrite={() => setTab("write")}
            onOpenDay={setSelectedDay}
          />`,
  ],
  [
`          <WordList
            progress={progress}
            lists={customLists}`,
`          <WordList
            progress={progress}
            lists={customLists}
            activeLevels={settings.levels}`,
  ],
  [
`function Home({
  stats,
  settings,
  todayWords,
  todayCompleted,
  history,
  onStart,
  onPracticeDays,
  onWrite,
  onToggleLevel,
  onOpenDay,
}: {
  stats: { total: number; known: number; learning: number; newCount: number; reviews: number };
  settings: Settings;
  todayWords: Word[];
  todayCompleted: number;
  history: DailySet[];
  onStart: (direction: Direction) => void;
  onPracticeDays: (sets: DailySet[], direction: Direction) => void;
  onWrite: () => void;
  onToggleLevel: (level: HskLevel) => void;
  onOpenDay: (set: DailySet) => void;
}) {`,
`function Home({
  stats,
  todayWords,
  todayCompleted,
  history,
  onStart,
  onPracticeDays,
  onWrite,
  onOpenDay,
}: {
  stats: { total: number; known: number; learning: number; newCount: number; reviews: number };
  todayWords: Word[];
  todayCompleted: number;
  history: DailySet[];
  onStart: (direction: Direction) => void;
  onPracticeDays: (sets: DailySet[], direction: Direction) => void;
  onWrite: () => void;
  onOpenDay: (set: DailySet) => void;
}) {`,
  ],
  [
`      <section className="level-selector" aria-label="Actieve niveaus">
        {hskLevels.map((level) => (
          <button
            key={level}
            className={settings.levels.includes(level as HskLevel) ? "active" : ""}
            onClick={() => onToggleLevel(level as HskLevel)}
          >
            HSK {level}
          </button>
        ))}
      </section>

`,
``,
  ],
  [
`  function restart() {
    if (!session) return;
    onSessionChange(createLearningSession(session.date, session.wordIds, session.title, session.direction));
  }
`,
`  function restart() {
    if (!session) return;
    onSessionChange(createLearningSession(session.date, session.wordIds, session.title, session.direction));
  }

  function switchDirection(direction: Direction) {
    if (!session || session.direction === direction) return;
    onSessionChange(createLearningSession(session.date, session.wordIds, session.title, direction));
  }
`,
  ],
  [
`      <div className="direction-indicator" aria-label="Vertaalrichting van deze oefening">
        <span className={exercise.direction === "zh-nl" ? "active" : ""}>
          Chinees → {meaningLanguageLabel}
        </span>
        <span className={exercise.direction === "nl-zh" ? "active" : ""}>
          {meaningLanguageLabel} → Chinees
        </span>
      </div>`,
`      <div className="direction-indicator" aria-label="Vertaalrichting van deze oefening">
        <button
          type="button"
          className={exercise.direction === "zh-nl" ? "active" : ""}
          onClick={() => switchDirection("zh-nl")}
          aria-pressed={exercise.direction === "zh-nl"}
        >
          Chinees → {meaningLanguageLabel}
        </button>
        <button
          type="button"
          className={exercise.direction === "nl-zh" ? "active" : ""}
          onClick={() => switchDirection("nl-zh")}
          aria-pressed={exercise.direction === "nl-zh"}
        >
          {meaningLanguageLabel} → Chinees
        </button>
      </div>`,
  ],
  [
`function WordList({
  progress,
  lists,
  onSelect,`,
`function WordList({
  progress,
  lists,
  activeLevels,
  onSelect,`,
  ],
  [
`  progress: ProgressMap;
  lists: CustomWordList[];
  onSelect: (word: Word) => void;`,
`  progress: ProgressMap;
  lists: CustomWordList[];
  activeLevels: HskLevel[];
  onSelect: (word: Word) => void;`,
  ],
  [
`  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<"all" | HskLevel>("all");
  const [newListName, setNewListName] = useState("");`,
`  const [query, setQuery] = useState("");
  const [extraLevels, setExtraLevels] = useState<HskLevel[]>([]);
  const [newListName, setNewListName] = useState("");`,
  ],
  [
`  const selectedList = lists.find((list) => list.id === selectedListId);
  const filtered = useMemo(
    () => searchWords(words.filter((word) => (
      (level === "all" || word.level === level)
      && (!onlySelectedList || !selectedList || selectedList.wordIds.includes(word.id))
    )), query),
    [query, level, onlySelectedList, selectedList],
  );`,
`  const selectedList = lists.find((list) => list.id === selectedListId);
  const selectedLevels = useMemo(
    () => hskLevels.filter((level) => activeLevels.includes(level) || extraLevels.includes(level)),
    [activeLevels, extraLevels],
  );
  const filtered = useMemo(
    () => searchWords(words.filter((word) => (
      selectedLevels.includes(word.level)
      && (!onlySelectedList || !selectedList || selectedList.wordIds.includes(word.id))
    )), query),
    [query, selectedLevels, onlySelectedList, selectedList],
  );

  function toggleExtraLevel(level: HskLevel) {
    if (activeLevels.includes(level)) return;
    setExtraLevels((current) => current.includes(level)
      ? current.filter((item) => item !== level)
      : [...current, level]);
  }`,
  ],
  [
`      <div className="filter-chips">
        {(["all", ...hskLevels] as const).map((item) => (
          <button className={level === item ? "active" : ""} key={item} onClick={() => setLevel(item)}>
            {item === "all" ? "Alles" : `HSK ${item}`}
          </button>
        ))}
      </div>`,
`      <div className="word-level-filter">
        <div className="section-heading compact-heading">
          <div>
            <span>HSK-niveaus</span>
            <small>Je ingestelde niveaus zijn standaard geselecteerd. Duid hier tijdelijk extra niveaus aan.</small>
          </div>
          {extraLevels.length > 0 && <button onClick={() => setExtraLevels([])}>Alleen standaard</button>}
        </div>
        <div className="filter-chips">
          {hskLevels.map((item) => {
            const isDefault = activeLevels.includes(item);
            const isActive = isDefault || extraLevels.includes(item);
            return (
              <button
                className={isActive ? "active" : ""}
                key={item}
                onClick={() => toggleExtraLevel(item)}
                aria-pressed={isActive}
                title={isDefault ? "Geselecteerd via Instellingen" : undefined}
              >
                HSK {item}{isDefault ? " · standaard" : ""}
              </button>
            );
          })}
        </div>
      </div>`,
  ],
];

let applied = 0;
for (const [before, after] of replacements) {
  if (text.includes(after) && !text.includes(before)) continue;
  if (!text.includes(before)) {
    throw new Error(`Kon codeblok niet vinden: ${before.slice(0, 120)}`);
  }
  text = text.replace(before, after);
  applied += 1;
}

writeFileSync(path, text);
console.log(`${applied} UI-wijzigingen toegepast.`);
