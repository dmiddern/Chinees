import fs from 'node:fs';

function replaceOnce(text, oldText, newText, label) {
  if (!text.includes(oldText)) throw new Error(`Missing ${label}`);
  return text.replace(oldText, newText);
}

{
  const path = 'src/lib/dailySets.ts';
  let s = fs.readFileSync(path, 'utf8');
  s = replaceOnce(s, `  if (!pool.length) return current;\n  if (current[date]) {\n    if (current[date].wordIds.length <= dailyGoal) return current;\n    return {\n      ...current,\n      [date]: {\n        ...current[date],\n        wordIds: current[date].wordIds.slice(0, dailyGoal),\n      },\n    };\n  }\n\n  // Een automatisch gegenereerde daglijst mag nooit een woord bevatten dat\n  // al in een eerdere automatisch gegenereerde daglijst stond. Eigen lijsten\n  // worden apart opgeslagen en maken dus bewust geen deel uit van deze set.\n`, `  if (!pool.length) return current;\n\n  // Een gegenereerde daglijst mag nooit een woord bevatten dat al in een\n  // eerdere gegenereerde daglijst stond. Meerdere lijsten op dezelfde dag\n  // zijn toegestaan en krijgen elk een eigen opslagsleutel.\n`, 'daily existing-list block');
  s = replaceOnce(s, `  return {\n    ...current,\n    [date]: {\n      date,\n      wordIds: selected.map((word) => word.id),\n      levels: [...levels],\n      createdAt: Date.now(),\n    },\n  };\n`, `  const createdAt = Date.now();\n  const storageKey = \`${'${date}:${createdAt}:${Math.random().toString(36).slice(2, 7)}'}\`;\n  return {\n    ...current,\n    [storageKey]: {\n      date,\n      wordIds: selected.map((word) => word.id),\n      levels: [...levels],\n      createdAt,\n    },\n  };\n`, 'daily return block');
  fs.writeFileSync(path, s);
}

{
  const path = 'src/App.tsx';
  let s = fs.readFileSync(path, 'utf8');
  s = replaceOnce(s, `  useEffect(() => {\n    setDailySets((current) => createDailySet(current, levelWords, settings.levels, DAILY_WORD_COUNT, progress));\n  }, [levelWords, progress, settings.levels]);\n\n  const todaySet = dailySets[localDateKey()];\n`, `  const todaySet = useMemo(\n    () => Object.values(dailySets)\n      .filter((set) => set.date === localDateKey())\n      .sort((a, b) => b.createdAt - a.createdAt)[0],\n    [dailySets],\n  );\n`, 'automatic creation block');
  s = replaceOnce(s, `  const dailyHistory = useMemo(\n    () => Object.values(dailySets).sort((a, b) => b.date.localeCompare(a.date)),\n    [dailySets],\n  );\n`, `  const dailyHistory = useMemo(\n    () => Object.values(dailySets).sort((a, b) => b.createdAt - a.createdAt),\n    [dailySets],\n  );\n`, 'history sort block');
  s = replaceOnce(s, `  function startToday(direction: Direction) {\n`, `  function generateDailySet() {\n    setDailySets((current) => createDailySet(current, levelWords, settings.levels, DAILY_WORD_COUNT, progress));\n  }\n\n  function startToday(direction: Direction) {\n`, 'startToday marker');
  s = replaceOnce(s, `    const dates = sortedSets.map((set) => set.date);\n    const title = sortedSets.length === 1\n      ? formatDailyDate(sortedSets[0].date).toLocaleLowerCase("nl-BE")\n      : \`${'${sortedSets.length} geselecteerde dagen'}\`;\n    setLearningSession(createLearningSession(\`review:${'${dates.join(",")}' }\`, wordIds, title, direction));\n`, `    const setIds = sortedSets.map((set) => \`${'${set.date}:${set.createdAt}'}\`);\n    const title = sortedSets.length === 1\n      ? formatDailyDate(sortedSets[0].date).toLocaleLowerCase("nl-BE")\n      : \`${'${sortedSets.length} geselecteerde lijsten'}\`;\n    setLearningSession(createLearningSession(\`review:${'${setIds.join(",")}' }\`, wordIds, title, direction));\n`, 'review identity block');
  s = replaceOnce(s, `            onStart={startToday}\n            onPracticeDays={startDailySetReview}\n`, `            onStart={startToday}\n            onGenerate={generateDailySet}\n            onPracticeDays={startDailySetReview}\n`, 'Home props');
  s = replaceOnce(s, `  onStart,\n  onPracticeDays,\n`, `  onStart,\n  onGenerate,\n  onPracticeDays,\n`, 'Home args');
  s = replaceOnce(s, `  onStart: (direction: Direction) => void;\n  onPracticeDays: (sets: DailySet[], direction: Direction) => void;\n`, `  onStart: (direction: Direction) => void;\n  onGenerate: () => void;\n  onPracticeDays: (sets: DailySet[], direction: Direction) => void;\n`, 'Home types');
  s = replaceOnce(s, `  const [selectedDates, setSelectedDates] = useState<string[]>([]);\n  const percentage = todayWords.length ? Math.round((todayCompleted / todayWords.length) * 100) : 0;\n  const selectedSets = history.filter((set) => selectedDates.includes(set.date));\n  const selectedWordCount = new Set(selectedSets.flatMap((set) => set.wordIds)).size;\n  const allSelected = history.length > 0 && selectedDates.length === history.length;\n\n  function toggleDay(date: string) {\n    setSelectedDates((current) => (\n      current.includes(date)\n        ? current.filter((item) => item !== date)\n        : [...current, date]\n    ));\n  }\n`, `  const [selectedSetKeys, setSelectedSetKeys] = useState<string[]>([]);\n  const percentage = todayWords.length ? Math.round((todayCompleted / todayWords.length) * 100) : 0;\n  const setKey = (set: DailySet) => \`${'${set.date}:${set.createdAt}'}\`;\n  const selectedSets = history.filter((set) => selectedSetKeys.includes(setKey(set)));\n  const selectedWordCount = new Set(selectedSets.flatMap((set) => set.wordIds)).size;\n  const allSelected = history.length > 0 && selectedSetKeys.length === history.length;\n\n  function toggleSet(set: DailySet) {\n    const key = setKey(set);\n    setSelectedSetKeys((current) => (\n      current.includes(key)\n        ? current.filter((item) => item !== key)\n        : [...current, key]\n    ));\n  }\n`, 'Home selection state');
  s = replaceOnce(s, `    <div className="page home-page">\n      <section className="hero-card">\n`, `    <div className="page home-page">\n      <div className="home-top-actions">\n        <button className="icon-action primary" type="button" onClick={onGenerate} aria-label="Nieuwe daglijst" title="Nieuwe daglijst">＋</button>\n      </div>\n      <section className="hero-card">\n`, 'home top');
  s = replaceOnce(s, `        <PracticeDirectionButtons onChoose={onStart} />\n        <button className="text-button" onClick={onWrite}>Of oefen eerst je schrijfwijze</button>\n`, `        {todayWords.length ? <PracticeDirectionButtons onChoose={onStart} /> : <p className="empty-list-copy">Nog geen daglijst</p>}\n        <button className="text-button" onClick={onWrite}>Of oefen eerst je schrijfwijze</button>\n`, 'today practice');
  s = replaceOnce(s, `onClick={() => setSelectedDates(allSelected ? [] : history.map((set) => set.date))}`, `onClick={() => setSelectedSetKeys(allSelected ? [] : history.map(setKey))}`, 'select all');
  s = replaceOnce(s, `const selected = selectedDates.includes(set.date);`, `const selected = selectedSetKeys.includes(setKey(set));`, 'selected set');
  s = replaceOnce(s, `key={set.date}>`, `key={setKey(set)}>`, 'history key');
  s = replaceOnce(s, `onClick={() => toggleDay(set.date)}`, `onClick={() => toggleSet(set)}`, 'toggle set');
  s = replaceOnce(s, `<strong>{formatDailyDate(set.date)}</strong>`, `<strong>{formatDailyDate(set.date)} · {new Intl.DateTimeFormat("nl-BE", { hour: "2-digit", minute: "2-digit" }).format(new Date(set.createdAt))}</strong>`, 'history label');
  fs.writeFileSync(path, s);
}

{
  const path = 'src/components/ListManager.tsx';
  let s = fs.readFileSync(path, 'utf8');
  const helper = `function ActionGlyph({ type }: { type: "play" | "import" | "export" | "trash" }) {\n  const common = { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };\n  if (type === "play") return <svg {...common} fill="currentColor" stroke="none"><path d="M8 5v14l11-7z" /></svg>;\n  if (type === "import") return <svg {...common}><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 20h14"/></svg>;\n  if (type === "export") return <svg {...common}><path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 4h14"/></svg>;\n  return <svg {...common}><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v5M14 11v5"/></svg>;\n}\n\n`;
  s = replaceOnce(s, `export default function ListManager({\n`, helper + `export default function ListManager({\n`, 'ListManager marker');
  s = replaceOnce(s, `>▶︎</button>`, `><ActionGlyph type="play" /></button>`, 'play icon');
  s = replaceOnce(s, `>▣</button>`, `><ActionGlyph type="import" /></button>`, 'import icon');
  s = replaceOnce(s, `>⇧</button>`, `><ActionGlyph type="export" /></button>`, 'export icon');
  s = replaceOnce(s, `>⌫</button>`, `><ActionGlyph type="trash" /></button>`, 'delete icon');
  fs.writeFileSync(path, s);
}

{
  const path = 'src/styles.css';
  let s = fs.readFileSync(path, 'utf8');
  if (!s.includes('.home-top-actions{')) s += `\n.home-top-actions{display:flex;justify-content:flex-end;margin-bottom:8px}\n.list-toolbar .icon-action svg{display:block}\n`;
  fs.writeFileSync(path, s);
}
