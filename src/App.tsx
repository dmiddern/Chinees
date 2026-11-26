import { exerciseKey, writingIsAccepted, recordPracticeResult, sessionMistakes, saveLastMistakes, loadLastMistakes, type ResultReason, type PracticeResult } from "./lib/practiceResults";
import { applyPinyinTone, applyPinyinUmlaut } from "./lib/pinyinInput";
import { formLabels, isCombined, checkMeaning, directions, directionLabels, promptValue, matchingPromptWords, checkPinyinAnswer, pinyinFeedback } from "./lib/practiceDirections";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal, flushSync } from "react-dom";
import { wordsData } from "./data/words";
import { literalGlosses } from "./data/literalGlosses";
import { articleKinds, articleLevels, articleSources, articles, type Article, type ArticleKind, type ArticleLevel } from "./data/articles";
import HanziPractice, { StrokeOrderPreview } from "./components/HanziPractice";
import ListManager from "./components/ListManager";
import { loadArticleProgress, recordArticleQuiz, saveArticleProgress, updateArticleProgress, type ArticleProgressMap } from "./lib/articleProgress";
import { createCustomList, saveMistakesAsList, loadCustomLists, saveCustomLists, toggleWordInList, type CustomWordList } from "./lib/customLists";
import { exercisesForArticle, relatedWordsForArticle } from "./lib/course";
import { clearDailySets, createDailySet, loadDailySets, localDateKey, saveDailySets, type DailySet, type DailySetMap } from "./lib/dailySets";
import { changeLearningDirection, createLearningSession, advanceLearningSession, loadLearningSession, saveLearningSession, sessionMatches, type LearningSession } from "./lib/learningSession";
import { emptyWordProgress, loadProgress, loadSettings, saveProgress, saveSettings, updateSkill } from "./lib/progress";
import { searchWords } from "./lib/search";
import { addCustomWord, loadCustomWords, type NewCustomWord } from "./lib/customWords";
import { speakMandarin } from "./lib/speech";
import { curatedExamplesForWord, examplesForWord } from "./lib/wordExamples";
import type { Direction, HskLevel, ProgressMap, Skill, Word } from "./types";

type Tab = "home" | "learn" | "guide" | "words" | "lists" | "write" | "sentences" | "settings";

interface Settings {
  toneHints: boolean;
  levels: HskLevel[];
  direction: Direction;
  speechRate: number;
  drawingPrecision: "relaxed" | "normal" | "precise";
}

const words = [...(wordsData as Word[]), ...loadCustomWords()];
const hskLevels: HskLevel[] = [1, 2, 3, 4, 5, 6, "7-9"];
const DAILY_WORD_COUNT = 5;
const singleCharacterMeanings = new Map(
  words
    .filter((word) => [...word.hanzi].length === 1)
    .map((word) => [word.hanzi, word.meaningNl.split(";")[0].trim()]),
);

function literalMeaning(word: Word) {
  if ([...word.hanzi].length === 1) return word.meaningNl.split(";")[0].trim();
  return [...word.hanzi]
    .filter((character) => /[\u3400-\u9fff]/.test(character))
    .map((character) => `${character} ${singleCharacterMeanings.get(character) || literalGlosses[character] || "betekenisdragend deel"}`)
    .join(" + ");
}
const defaultSettings: Settings = {
  toneHints: false,
  levels: [1],
  direction: "zh-nl",
  speechRate: 0.72,
  drawingPrecision: "normal",
};

type IconName = "learn" | "theory" | "words" | "lists" | "write" | "settings" | "plus" | "speaker" | "info" | "search" | "pencil" | "bookmark" | "bookmark-filled" | "save";
function MonoIcon({ name, size = 22 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  return <svg {...common}>
    {name === "learn" && <><path d="M4 5.5h7a3 3 0 0 1 3 3V20a3 3 0 0 0-3-3H4z"/><path d="M20 5.5h-4a3 3 0 0 0-3 3M16 17h4V5.5"/></>}
    {name === "theory" && <><path d="M8 3h9l4 4v14H8z"/><path d="M17 3v5h4M11 12h7M11 16h7M4 7v14"/></>}
    {name === "words" && <><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M7 9h10M7 13h6M7 17h9"/></>}
    {name === "lists" && <><path d="M9 6h12M9 12h12M9 18h12"/><path d="m3 6 1.5 1.5L7 4m-4 8 1.5 1.5L7 10m-4 8 1.5 1.5L7 16"/></>}
    {name === "write" && <><path d="M4 20h16M5 16l-.5 3.5L8 19l11-11-3-3z"/><path d="m14 7 3 3"/></>}
    {name === "settings" && <><circle cx="12" cy="12" r="3"/><path d="m19 13 2 1-1.5 3-2.1-.5c-.5.5-1 .8-1.6 1L15 20h-3l-.6-2.5c-.6-.2-1.2-.5-1.7-1l-2.1.5L6 14l2-1a7 7 0 0 1 0-2l-2-1 1.6-3 2.1.5c.5-.5 1.1-.8 1.7-1L12 4h3l.8 2.5c.6.2 1.1.5 1.6 1l2.1-.5L21 10l-2 1a8 8 0 0 1 0 2Z" transform="translate(-1.5)"/></>}
    {name === "plus" && <path d="M12 5v14M5 12h14"/>}
    {name === "save" && <><path d="M4 3h14l3 3v15H3V3z"/><path d="M7 3v7h10V3M7 21v-8h10v8M14 3v5"/></>}
    {(name === "bookmark" || name === "bookmark-filled") && <path d="M6 4.5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2V21l-6-4-6 4z" fill={name === "bookmark-filled" ? "currentColor" : "none"}/>} 
    {name === "speaker" && <><path d="M4 9h4l5-4v14l-5-4H4zM17 9a4 4 0 0 1 0 6M19.5 6a8 8 0 0 1 0 12"/></>}
    {name === "info" && <><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></>}
    {name === "search" && <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>}
    {name === "pencil" && <><path d="m4 20 4-.8L20 7.2l-3.2-3.2L4.8 16zM15 6l3.2 3.2"/></>}
  </svg>;
}

const navItems: { id: Tab; label: string; icon: IconName }[] = [
  { id: "home", label: "Leren", icon: "learn" },
  { id: "guide", label: "Theorie", icon: "theory" },
  { id: "words", label: "Woorden", icon: "words" },
  { id: "sentences", label: "Zinnen", icon: "theory" },
  { id: "lists", label: "Lijsten", icon: "lists" },
  { id: "write", label: "Schrijven", icon: "write" },
];

function levelLabel(level: HskLevel, custom = false) {
  return custom ? "⊕" : `HSK ${level}`;
}

function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [lastMainTab, setLastMainTab] = useState<Tab>("home");
  const [theme, setTheme] = useState<"light" | "dark">(() => localStorage.getItem("chinees.theme") === "dark" ? "dark" : "light");
  const openSettings = () => { if (tab !== "settings") setLastMainTab(tab); setTab("settings"); };
  useEffect(() => { localStorage.setItem("chinees.theme", theme); document.documentElement.dataset.appTheme = theme; }, [theme]);
  const [progress, setProgress] = useState<ProgressMap>(() => loadProgress());
  const [settings, setSettings] = useState<Settings>(() => loadSettings(defaultSettings));
  const [dailySets, setDailySets] = useState<DailySetMap>(() => loadDailySets());
  const [articleProgress, setArticleProgress] = useState<ArticleProgressMap>(() => loadArticleProgress());
  const [customLists, setCustomLists] = useState<CustomWordList[]>(() => loadCustomLists());
  const [learningSession, setLearningSession] = useState<LearningSession | null>(() => loadLearningSession());
  const [selectedDay, setSelectedDay] = useState<DailySet | null>(null);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [writingWord, setWritingWord] = useState<Word | null>(null);
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);

  useEffect(() => saveProgress(progress), [progress]);
  useEffect(() => {
    saveSettings(settings);
    document.documentElement.dataset.toneHints = settings.toneHints ? "on" : "off";
  }, [settings]);
  useEffect(() => saveDailySets(dailySets), [dailySets]);
  useEffect(() => saveArticleProgress(articleProgress), [articleProgress]);
  useEffect(() => saveCustomLists(customLists), [customLists]);
  const [lastMistakes, setLastMistakes] = useState(loadLastMistakes);
  useEffect(() => {
    saveLearningSession(learningSession);
    if (learningSession && learningSession.index >= learningSession.queue.length) {
      saveLastMistakes(learningSession);
      setLastMistakes(sessionMistakes(learningSession));
    }
  }, [learningSession]);

  useEffect(() => {
    const listener = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    window.addEventListener("beforeinstallprompt", listener);
    return () => window.removeEventListener("beforeinstallprompt", listener);
  }, []);

  const levelWords = useMemo(
    () => words.filter((word) => !word.custom && settings.levels.includes(word.level)),
    [settings.levels],
  );

  const todaySet = useMemo(
    () => Object.values(dailySets)
      .filter((set) => set.date === localDateKey())
      .sort((a, b) => b.createdAt - a.createdAt)[0],
    [dailySets],
  );
  const todayWords = useMemo(
    () => (todaySet?.wordIds || []).map((id) => words.find((word) => word.id === id)).filter((word): word is Word => Boolean(word)),
    [todaySet],
  );
  const dailyHistory = useMemo(
    () => Object.values(dailySets).sort((a, b) => b.createdAt - a.createdAt),
    [dailySets],
  );
  const todayCompleted = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    return todayWords.filter((word) => {
      const item = progress[word.id];
      return item
        && (
          (item.meaning.lastReviewedAt || 0) >= startOfToday.getTime()
          || (
            (item.pronunciation.lastReviewedAt || 0) >= startOfToday.getTime()
            && (item.writing.lastReviewedAt || 0) >= startOfToday.getTime()
          )
        );
    }).length;
  }, [progress, todayWords]);

  const stats = useMemo(() => {
    const available = words.filter((word) => !word.custom && settings.levels.includes(word.level));
    const known = available.filter((word) => {
      const item = progress[word.id];
      return item?.meaning.status === "known" && item?.pronunciation.status === "known";
    }).length;
    const learning = available.filter((word) => {
      const item = progress[word.id];
      return item && (item.meaning.status === "learning" || item.pronunciation.status === "learning");
    }).length;
    const reviews = available.filter((word) => {
      const item = progress[word.id];
      return item && Math.min(item.meaning.dueAt, item.pronunciation.dueAt) <= Date.now()
        && (item.meaning.correct + item.meaning.incorrect + item.pronunciation.correct + item.pronunciation.incorrect > 0);
    }).length;
    return { total: available.length, known, learning, newCount: available.length - known - learning, reviews };
  }, [progress, settings.levels]);

  function updateSettings(patch: Partial<Settings>) {
    setSettings((current) => ({ ...current, ...patch }));
  }

  function toggleLevel(level: HskLevel) {
    const levels = settings.levels.includes(level)
      ? settings.levels.filter((item) => item !== level)
      : [...settings.levels, level].sort(
        (a, b) => hskLevels.indexOf(a) - hskLevels.indexOf(b),
      ) as HskLevel[];
    if (levels.length) updateSettings({ levels });
  }

  async function installApp() {
    if (!installPrompt) return;
    const prompt = installPrompt as Event & { prompt: () => Promise<void> };
    await prompt.prompt();
    setInstallPrompt(null);
  }

  function rate(wordId: number, skill: Skill, correct: boolean, direction?: Direction, directionCorrect = correct) {
    setProgress((current) => updateSkill(current, wordId, skill, correct, direction, directionCorrect));
  }

  function generateDailySet() {
    setDailySets((current) => createDailySet(current, levelWords, settings.levels, DAILY_WORD_COUNT, progress));
  }

  function startToday(direction: Direction) {
    if (!todaySet?.wordIds.length) return;
    updateSettings({ direction });
    setLearningSession((current) => (
      current && sessionMatches(current, todaySet.date, todaySet.wordIds) &&
        (current.index < current.queue.length || current.direction === direction)
        ? changeLearningDirection(current, direction)
        : createLearningSession(todaySet.date, todaySet.wordIds, "vandaag", direction)
    ));
    setTab("learn");
  }

  function startDailySetReview(sets: DailySet[], direction: Direction) {
    const sortedSets = [...sets].sort((a, b) => a.date.localeCompare(b.date));
    const wordIds = [...new Set(sortedSets.flatMap((set) => set.wordIds))];
    if (!wordIds.length) return;
    updateSettings({ direction });
    const setIds = sortedSets.map((set) => `${set.date}:${set.createdAt}`);
    const title = sortedSets.length === 1
      ? formatDailyDate(sortedSets[0].date).toLocaleLowerCase("nl-BE")
      : `${sortedSets.length} geselecteerde lijsten`;
    openListSession(`review:${setIds.join(",")}`, wordIds, title, direction);
    setSelectedDay(null);
  }

  function openListSession(key: string, wordIds: number[], title: string, direction: Direction = settings.direction) {
    if (!wordIds.length) return;
    setLearningSession(current => {
      if (current && current.index < current.queue.length && sessionMatches(current, key, wordIds)) {
        return changeLearningDirection(current, direction);
      }
      return createLearningSession(key, wordIds, title, direction);
    });
    setTab("learn");
  }

  return (
    <div className="app-shell" data-app-theme={theme}>
      {tab !== "learn" && tab !== "words" && <header className="topbar">
        <button className="brand" onClick={() => setTab("home")} aria-label="Ga naar vandaag">
          <span className="brand-mark">中</span>
          <span>
            <strong>Chinees</strong>
            <small>HSK 1 · 2 · 3 · 4 · 5 · 6 · 7-9</small>
          </span>
        </button>
        <div className="topbar-actions">
          {installPrompt && <button className="install-button" onClick={installApp}>Installeer</button>}
          {tab === "settings" ? (
            <button className="global-settings-button" type="button" aria-label="Terug naar vorig scherm" onClick={() => setTab(lastMainTab)}>✕</button>
          ) : (
            <button className="global-settings-button" type="button" aria-label="Instellingen" onClick={openSettings}><MonoIcon name="settings" /></button>
          )}
        </div>
      </header>}

      <main>
        {tab === "home" && (
          <Home
            session={learningSession}
            onResume={() => setTab("learn")}
            lastMistakes={lastMistakes}
            onRetryMistakes={() => { if (lastMistakes) openListSession(`mistakes:${lastMistakes.id}`, lastMistakes.wordIds, "Nog oefenen", lastMistakes.direction); }}
            stats={stats}
            settings={settings}
            todayWords={todayWords}
            todayCompleted={todayCompleted}
            history={dailyHistory}
            onStart={startToday}
            onGenerate={generateDailySet}
            onPracticeDays={startDailySetReview}
            onWrite={() => setTab("write")}
            onToggleLevel={toggleLevel}
            onOpenDay={setSelectedDay}
          />
        )}
        {tab === "learn" && (
          <Learn
            onSaveMistakes={(completed) => setCustomLists(current => saveMistakesAsList(current, sessionMistakes(completed)))}
            progress={progress}
            session={learningSession}
            settings={settings}
            onSessionChange={setLearningSession}
            onRate={rate}
            lists={customLists}
            onSaveBookmarkChanges={(wordId, selectedIds, pendingLists) => {
              setCustomLists((current) => {
                const updated = current.map((list) => {
                  const hasWord = list.wordIds.includes(wordId);
                  const shouldHaveWord = selectedIds.includes(list.id);
                  if (hasWord === shouldHaveWord) return list;
                  return {
                    ...list,
                    wordIds: shouldHaveWord ? [...list.wordIds, wordId] : list.wordIds.filter((id) => id !== wordId),
                    updatedAt: Date.now(),
                  };
                });
                return [...updated, ...pendingLists.map((list) => ({
                  ...list,
                  wordIds: selectedIds.includes(list.id) ? [wordId] : [],
                }))];
              });
            }}
            onExit={() => setTab("home")}
          />
        )}
        {tab === "sentences" && <SentencePractice speechRate={settings.speechRate} dailySets={dailySets} />}
        {tab === "guide" && (
          <ArticleGuide
            progress={articleProgress}
            speechRate={settings.speechRate}
            onPractice={(wordIds, title) => openListSession(`article:${title}`, wordIds, title)}
            onProgress={(articleId, patch) => (
              setArticleProgress((current) => updateArticleProgress(current, articleId, patch))
            )}
            onQuiz={(articleId, correct) => (
              setArticleProgress((current) => recordArticleQuiz(current, articleId, correct))
            )}
          />
        )}
        {tab === "words" && (
          <WordList
            onSelect={setSelectedWord}
            onSpeak={(word) => speakMandarin(word.hanzi, settings.speechRate)}
            onOpenSettings={openSettings}
            onAddWord={(input) => {
              if (addCustomWord(input)) window.location.reload();
            }}
          />
        )}
        {tab === "lists" && (
          <ListManager
            lists={customLists}
            words={words}
            onCreate={(name) => setCustomLists((current) => createCustomList(current, name))}
            onDelete={(listId) => setCustomLists((current) => current.filter((list) => list.id !== listId))}
            onToggleWord={(listId, wordId) => setCustomLists((current) => toggleWordInList(current, listId, wordId))}
            onReplaceWords={(listId, wordIds) => setCustomLists((current) => current.map((list) => list.id === listId ? { ...list, wordIds: [...new Set(wordIds)], updatedAt: Date.now() } : list))}
            onPractice={(list) => openListSession(`custom:${list.id}`, list.wordIds, list.name, list.direction)}
          />
        )}
        {tab === "write" && (
          <Writing
            words={words.filter((word) => word.custom || settings.levels.includes(word.level))}
            initialWord={writingWord}
            rate={settings.speechRate}
            drawingPrecision={settings.drawingPrecision}
            onRate={(wordId, correct) => rate(wordId, "writing", correct)}
          />
        )}
        {tab === "settings" && (
          <SettingsView
            settings={settings}
            theme={theme}
            onThemeChange={setTheme}
            onChange={updateSettings}
            onToggleLevel={toggleLevel}
            onReset={() => {
              if (window.confirm("Wil je alle leerresultaten en bewaarde daglijsten verwijderen?")) {
                setProgress({});
                setDailySets({});
                setArticleProgress({});
                setLearningSession(null);
                clearDailySets();
              }
            }}
          />
        )}
      </main>

      {tab !== "learn" && <nav className="bottom-nav" aria-label="Hoofdnavigatie">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={tab === item.id ? "active" : ""}
            onClick={() => setTab(item.id)}
            aria-current={tab === item.id ? "page" : undefined}
          >
            <span aria-hidden="true"><MonoIcon name={item.icon} size={21} /></span>
            {item.label}
          </button>
        ))}
      </nav>}

      {selectedWord && (
        <WordSheet
          word={selectedWord}
          progress={progress[selectedWord.id] || emptyWordProgress()}
          speechRate={settings.speechRate}
          lists={customLists}
          onToggleWord={(listId, wordId) => setCustomLists((current) => toggleWordInList(current, listId, wordId))}
          onClose={() => setSelectedWord(null)}
          onWrite={() => {
            setWritingWord(selectedWord);
            setSelectedWord(null);
            setTab("write");
          }}
          onNotesChange={(notes) => {
            setProgress((current) => ({
              ...current,
              [selectedWord.id]: {
                ...(current[selectedWord.id] || emptyWordProgress()),
                notes,
              },
            }));
          }}
        />
      )}

      {selectedDay && (
        <DailySetSheet
          set={selectedDay}
          settings={settings}
          onClose={() => setSelectedDay(null)}
          onPractice={(direction) => startDailySetReview([selectedDay], direction)}
          onSelect={(word) => {
            setSelectedDay(null);
            setSelectedWord(word);
          }}
        />
      )}
    </div>
  );
}

function Home({
  session,
  onResume,
  lastMistakes,
  onRetryMistakes,
  stats,
  settings,
  todayWords,
  todayCompleted,
  history,
  onStart,
  onGenerate,
  onPracticeDays,
  onWrite,
  onToggleLevel,
  onOpenDay,
}: {
  session: LearningSession | null;
  onResume: () => void;
  lastMistakes: ReturnType<typeof loadLastMistakes>;
  onRetryMistakes: () => void;
  stats: { total: number; known: number; learning: number; newCount: number; reviews: number };
  settings: Settings;
  todayWords: Word[];
  todayCompleted: number;
  history: DailySet[];
  onStart: (direction: Direction) => void;
  onGenerate: () => void;
  onPracticeDays: (sets: DailySet[], direction: Direction) => void;
  onWrite: () => void;
  onToggleLevel: (level: HskLevel) => void;
  onOpenDay: (set: DailySet) => void;
}) {
  const [selectedSetKeys, setSelectedSetKeys] = useState<string[]>([]);
  const [hiddenResume, setHiddenResume] = useState(() => localStorage.getItem("chinees.hidden-resume"));
  const [hiddenRetry, setHiddenRetry] = useState(() => localStorage.getItem("chinees.hidden-retry"));
  const active = session && session.index < session.queue.length ? session : null;
  const resumeId = active?.id || active?.date;
  const retryInProgress = active?.date.startsWith("mistakes:");
  const showResume = active && resumeId !== hiddenResume;
  const showRetry = lastMistakes && lastMistakes.wordIds.length > 0 && !retryInProgress && lastMistakes.id !== hiddenRetry;

  function hideRetry() {
    if (!lastMistakes) return;
    localStorage.setItem("chinees.hidden-retry", lastMistakes.id);
    setHiddenRetry(lastMistakes.id);
  }

  function hideResume() {
    if (!resumeId) return;
    localStorage.setItem("chinees.hidden-resume", resumeId);
    setHiddenResume(resumeId);
    if (retryInProgress) hideRetry();
  }

  const percentage = todayWords.length ? Math.round((todayCompleted / todayWords.length) * 100) : 0;
  const setKey = (set: DailySet) => `${set.date}:${set.createdAt}`;
  const selectedSets = history.filter((set) => selectedSetKeys.includes(setKey(set)));
  const selectedWordCount = new Set(selectedSets.flatMap((set) => set.wordIds)).size;
  const allSelected = history.length > 0 && selectedSetKeys.length === history.length;

  function toggleSet(set: DailySet) {
    const key = setKey(set);
    setSelectedSetKeys((current) => (
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key]
    ));
  }

  return (
    <div className="page home-page">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Jouw leermoment</p>
          <h1>Leer Chinees</h1>
          <p className="hero-copy">Oefen betekenis, uitspraak en schrijfwijze afzonderlijk op jouw tempo.</p>
        </div>
        <div className="hero-character" aria-hidden="true">学</div>
      </section>

      <section className="level-selector" aria-label="Actieve niveaus">
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

      {(showResume || showRetry) && <section className="practice-shortcuts" aria-label="Laatste oefeningen">
        {showResume && <div>
          <button onClick={onResume}><strong>{retryInProgress ? "Hervat je foutenoefening" : `Hervat ${active.title || "je woordenlijst"}`}</strong><small>Woord {active.index + 1} van {active.queue.length}</small></button>
          <button onClick={hideResume} aria-label="Hervatten verbergen">×</button>
        </div>}
        {showRetry && <div>
          <button onClick={onRetryMistakes}><strong>Oefen je laatste fouten</strong><small>{lastMistakes.wordIds.length} {lastMistakes.wordIds.length === 1 ? "woord" : "woorden"}</small></button>
          <button onClick={hideRetry} aria-label="Laatste fouten verbergen">×</button>
        </div>}
      </section>}

      <section className="today-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Vandaag</p>
            <h2>{todayWords.length ? `${todayCompleted} van ${todayWords.length} afgerond` : "Je daglijst wordt klaargezet"}</h2>
          </div>
          <div className="goal-ring" style={{ "--progress": `${percentage * 3.6}deg` } as React.CSSProperties}>
            <strong>{percentage}%</strong>
          </div>
        </div>
        {todayWords.length || selectedSets.length ? (
          <PracticeDirectionButtons
            onChoose={(direction) => selectedSets.length > 0 ? onPracticeDays(selectedSets, direction) : onStart(direction)}
            initialDirection={settings.direction}
            onGenerate={onGenerate}
            onPracticeSelected={selectedSets.length > 0 ? () => onPracticeDays(selectedSets, settings.direction) : undefined}
            selectedWordCount={selectedWordCount}
          />
        ) : (
          <div className="practice-direction-heading empty">
            <p>Nog geen daglijst</p>
            {selectedSets.length > 0 && (
              <button className="icon-action daily-selected-play" type="button" onClick={() => onPracticeDays(selectedSets, settings.direction)} aria-label={`Oefen ${selectedWordCount} geselecteerde woorden`} title={`Oefen ${selectedWordCount} geselecteerde woorden`}>▶</button>
            )}
            <button className="icon-action primary daily-generate-button" type="button" onClick={onGenerate} aria-label="Nieuwe daglijst" title="Nieuwe daglijst">＋</button>
          </div>
        )}
        <button className="text-button" onClick={onWrite}>Of oefen eerst je schrijfwijze</button>
      </section>

      <section className="stats-grid" aria-label="Voortgang">
        <StatCard value={stats.known} label="Gekend" tone="success" />
        <StatCard value={stats.learning} label="Bezig" tone="warning" />
        <StatCard value={stats.newCount} label="Nieuw" tone="neutral" />
      </section>

      <section className="daily-history">
        <div className="section-heading">
          <div><p className="eyebrow">Daglijsten</p><h2>Terugkijken</h2></div>
          {history.length > 0 && (
            <button
              className="daily-select-all"
              onClick={() => setSelectedSetKeys(allSelected ? [] : history.map(setKey))}
            >
              {allSelected ? "Wis selectie" : "Selecteer alles"}
            </button>
          )}
        </div>
        <div className="daily-history-list">
          {history.map((set) => {
            const dayWords = set.wordIds.map((id) => words.find((word) => word.id === id)).filter((word): word is Word => Boolean(word));
            const selected = selectedSetKeys.includes(setKey(set));
            return (
              <div className={`daily-history-row ${selected ? "selected" : ""}`} key={setKey(set)}>
                <button
                  className="daily-day-select"
                  onClick={() => toggleSet(set)}
                  aria-pressed={selected}
                  aria-label={`${formatDailyDate(set.date)} ${selected ? "uit selectie verwijderen" : "selecteren"}`}
                >
                  <span className="daily-check" aria-hidden="true">{selected ? "✓" : ""}</span>
                  <span>
                    <strong>{formatDailyDate(set.date)} · {new Intl.DateTimeFormat("nl-BE", { hour: "2-digit", minute: "2-digit" }).format(new Date(set.createdAt))}</strong>
                    <small>{dayWords.length} woorden · HSK {set.levels.join(", ")}</small>
                  </span>
                  <span className="daily-word-preview">{dayWords.slice(0, 5).map((word) => word.hanzi).join(" · ")}</span>
                </button>
                <button className="daily-day-open" onClick={() => onOpenDay(set)} aria-label={`Bekijk ${formatDailyDate(set.date)}`}>
                  <span aria-hidden="true">›</span>
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function formatDailyDate(date: string) {
  const today = localDateKey();
  const yesterday = localDateKey(new Date(Date.now() - 24 * 60 * 60 * 1000));
  if (date === today) return "Vandaag";
  if (date === yesterday) return "Gisteren";
  return new Intl.DateTimeFormat("nl-BE", { weekday: "short", day: "numeric", month: "long" })
    .format(new Date(`${date}T12:00:00`));
}

function StatCard({ value, label, tone }: { value: number; label: string; tone: string }) {
  return (
    <div className={`stat-card ${tone}`}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function PracticeDirectionButtons({
  onChoose,
  initialDirection,
  onGenerate,
  onPracticeSelected,
  selectedWordCount = 0,
}: {
  onChoose: (direction: Direction) => void;
  initialDirection: Direction;
  onGenerate?: () => void;
  onPracticeSelected?: () => void;
  selectedWordCount?: number;
}) {
  const [source, setSource] = useState(() => initialDirection.split("-")[0]);
  return (
    <div className="home-directions">
      <div className="direction-toolbar">
        <h2>{onPracticeSelected ? "Selectie oefenen" : "Daglijst oefenen"}</h2>
        {onPracticeSelected && (
          <button className="icon-action daily-selected-play" type="button" onClick={onPracticeSelected} aria-label={`Oefen ${selectedWordCount} geselecteerde woorden`} title={`Oefen ${selectedWordCount} geselecteerde woorden`}>▶</button>
        )}
        {onGenerate && (
          <button className="icon-action primary daily-generate-button" type="button" onClick={onGenerate} aria-label="Nieuwe daglijst" title="Nieuwe daglijst">＋</button>
        )}
      </div>
      <fieldset>
        <legend>Vertrek van</legend>
        <div className="source-options">{Object.entries(formLabels).map(([key, label]) => (
          <button key={key} aria-pressed={source === key} onClick={() => setSource(key)}>{label}</button>
        ))}</div>
      </fieldset>
      <fieldset>
        <legend>Antwoord in</legend>
        <div className="target-options">{directions.filter(direction => direction.startsWith(source + "-")).map(direction => (
          <button key={direction} className="button secondary-button" aria-label={directionLabels[direction]} onClick={() => onChoose(direction)}>
            {directionLabels[direction].split(" → ")[1]}
          </button>
        ))}</div>
      </fieldset>
    </div>
  );
}

function Learn({
  onSaveMistakes,
  progress,
  session,
  settings,
  onSessionChange,
  onRate,
  lists,
  onSaveBookmarkChanges,
  onExit,
}: {
  onSaveMistakes: (session: LearningSession) => void;
  progress: ProgressMap;
  session: LearningSession | null;
  settings: Settings;
  onSessionChange: (session: LearningSession) => void;
  onRate: (id: number, skill: Skill, correct: boolean, direction?: Direction, directionCorrect?: boolean) => void;
  lists: CustomWordList[];
  onSaveBookmarkChanges: (wordId: number, selectedIds: string[], pendingLists: CustomWordList[]) => void;
  onExit: () => void;
}) {
  const pinyinInputRef = useRef<HTMLInputElement>(null);
  const meaningInputRef = useRef<HTMLInputElement>(null);
  function navigateWithInputFocus(action: () => void) {
    // Mount the next input within the tap handler so mobile browsers can open the keyboard.
    flushSync(action);
    const input = pinyinInputRef.current ?? meaningInputRef.current;
    if (input && !input.closest(".combined-card")) input.focus({ preventScroll: true });
  }
  const [singlePinyin, setSinglePinyin] = useState("");
  const pending = session && session.pendingPinyin?.key === exerciseKey(session) ? session.pendingPinyin : undefined;
  const direction = session?.queue[session.index]?.direction;
  const combined = isCombined(direction);
  const needsMeaning = direction?.split("-").slice(1).includes("nl");
  const needsPinyin = direction?.endsWith("pinyin") || direction === "nl-pinyin-zh";
  const needsWriting = direction?.endsWith("zh");
  const meaningInput = pending?.meaning ?? "";
  const pinyinInput = combined ? pending?.input ?? "" : singlePinyin;

  function saveAnswerDraft(input: string, writingMistakes = pending?.writingMistakes, meaning = meaningInput) {
    if (!session) return;
    const answerWordId = pending?.answerWordId ?? session.queue[session.index].wordId;
    onSessionChange({ ...session, pendingPinyin: {
      key: exerciseKey(session), input, meaning, answerWordId, writingMistakes,
    } });
  }

  function setPinyinInput(input: string) {
    if (combined) saveAnswerDraft(input);
    else setSinglePinyin(input);
  }
  function editPinyin(tone: number | "ü") {
    const input = pinyinInputRef.current;
    if (!input) return;
    const start = input.selectionStart ?? pinyinInput.length;
    const end = input.selectionEnd ?? start;
    const edit = tone === "ü"
      ? applyPinyinUmlaut(pinyinInput, start, end)
      : applyPinyinTone(pinyinInput, start, end, tone);
    setPinyinInput(edit.value);
    input.focus({ preventScroll: true });
    requestAnimationFrame(() => input.setSelectionRange(edit.cursor, edit.cursor));
  }
  const currentResult = session?.results?.[session.index];
  const pinyinCorrect = currentResult?.pinyinCorrect ?? (currentResult?.reason === "pinyin" ? currentResult.correct : null);
  const [mistakesSaved, setMistakesSaved] = useState(false);
  useEffect(() => setMistakesSaved(false), [session?.id]);
  function recordOutcome(correct: boolean, reason: ResultReason, details: Pick<PracticeResult,"input" | "writingMistakes" | "meaning" | "meaningCorrect" | "answerWordId"> = {}) {
    if (!session) return session;
    const exercise = session.queue[session.index];
    const promptWord = words.find(candidate => candidate.id === exercise.wordId);
    const candidates = combined && promptWord ? matchingPromptWords(promptWord, exercise.direction, words) : [];
    // The stroke quiz fixes the written word. With two text answers, accept any matching reading and meaning of the same word.
    const choices = needsWriting ? [promptWord].filter((w): w is Word => !!w) : candidates;
    const pronunciationMatches = (candidate: Word) => !needsPinyin || checkPinyinAnswer(pinyinInput, candidate, exercise.direction, [candidate]);
    const target = choices.find(w => pronunciationMatches(w) && (!needsMeaning || checkMeaning(meaningInput, w)))
      ?? choices.find(w => needsMeaning && checkMeaning(meaningInput, w)) ?? promptWord;
    const pronunciationCorrect = !!target && pronunciationMatches(target);
    const meaningCorrect = !!target && checkMeaning(meaningInput, target);
    const writingMistakes = details.writingMistakes ?? pending?.writingMistakes;
    const writingCorrect = writingIsAccepted(writingMistakes || []);
    const combinedCorrect = reason === "combined" && (!needsPinyin || pronunciationCorrect)
      && (!needsWriting || writingCorrect) && (!needsMeaning || meaningCorrect);
    const updated = recordPracticeResult(session, combined ? combinedCorrect : correct, reason, combined ? {
      ...details, writingMistakes, input: pinyinInput, pinyinCorrect: needsPinyin && pinyinInput.trim() ? pronunciationCorrect : undefined,
      meaning: needsMeaning ? meaningInput : undefined, meaningCorrect: needsMeaning ? meaningCorrect : undefined, answerWordId: target?.id,
    } : details);
    if (updated !== session) {
      if (combined) {
        if (needsMeaning) onRate(exercise.wordId, "meaning", meaningCorrect);
        if (needsPinyin) onRate(exercise.wordId, "pronunciation", pronunciationCorrect, needsWriting ? undefined : exercise.direction, combinedCorrect);
        if (needsWriting) onRate(exercise.wordId, "writing", writingCorrect, exercise.direction, combinedCorrect);
      } else {
        onRate(exercise.wordId, exercise.skill, correct, exercise.direction);
      }
    }
    return updated;
  }
  useEffect(() => {
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<{ key: string; mistakes: number[] }>).detail;
      if (!session || session.revealed || !detail || detail.key !== exerciseKey(session)) return;
      const count = [...(words.find(word => word.id === (pending?.answerWordId ?? session.queue[session.index]?.wordId))?.hanzi || "")].filter(char => /[\u3400-\u9fff]/.test(char)).length;
      if (!Array.isArray(detail.mistakes) || detail.mistakes.length !== count) return;
      if (combined) {
        saveAnswerDraft(pinyinInput, detail.mistakes);
        return;
      }
      const updated = recordOutcome(writingIsAccepted(detail.mistakes), "writing", { writingMistakes: detail.mistakes });
      if (updated) onSessionChange({ ...updated, revealed: true });
    };
    window.addEventListener("chinees:writing-result", listener);
    return () => window.removeEventListener("chinees:writing-result", listener);
  }, [session, onRate, onSessionChange]);
  useEffect(() => { if (!session?.revealed) { setSinglePinyin(""); } }, [session?.index, session?.direction, session?.date, session?.revealed]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [bookmarkOpen, setBookmarkOpen] = useState(false);
  const [bookmarkSelectedIds, setBookmarkSelectedIds] = useState<string[]>([]);
  const [pendingBookmarkLists, setPendingBookmarkLists] = useState<CustomWordList[]>([]);
  const [bookmarkLastTouched, setBookmarkLastTouched] = useState<string | null>(null);
  const [newListName, setNewListName] = useState("");

  function openBookmarkSheet() {
    if (!session?.queue[session.index]) return;
    const wordId = session.queue[session.index].wordId;
    setBookmarkSelectedIds(lists.filter((list) => list.wordIds.includes(wordId)).map((list) => list.id));
    setPendingBookmarkLists([]);
    setBookmarkLastTouched(null);
    setNewListName("");
    setBookmarkOpen(true);
  }

  function cancelBookmarkChanges() {
    setBookmarkOpen(false);
    setPendingBookmarkLists([]);
    setNewListName("");
  }
  function rememberSaveList(listId: string) {
    localStorage.setItem("chinees.last-custom-list.v1", listId);
  }

  function exitSession() {
    if (session && session.index < session.queue.length &&
        !window.confirm("Oefensessie verlaten? Je voortgang blijft bewaard.")) return;
    setSettingsOpen(false);
    onExit();
  }

  function restart() {
    if (!session) return;
    onSessionChange(createLearningSession(session.date, session.wordIds, session.title, session.direction));
  }

  if (!session?.queue.length) return <EmptyState title="Je daglijst wordt klaargezet" text="Ga even terug naar Vandaag en open de leersessie opnieuw." />;
  const exercise = session.queue[session.index];
  if (!exercise) {
    const mistakes = sessionMistakes(session);
    const saved = mistakesSaved || lists.some(list => list.mistakeSessionId === mistakes.id);
    return (
      <div className="page daily-complete">
        <div className="hero-character">好</div>
        <p className="eyebrow">Daglijst voltooid</p>
        <h1>Goed gewerkt</h1>
        <p>
          Je hebt {Object.keys(session.results || {}).length} van {session.wordIds.length} woorden uit {session.title || "deze reeks"} geoefend in{" "}
          {[...new Set(session.queue.map(exercise => directionLabels[exercise.direction]))].join(", ")}.
        </p>
        {mistakes.wordIds.length > 0 ? <section className="session-mistakes">
          <h2>Nog oefenen · {mistakes.wordIds.length} woorden</h2>
          <ul className="session-mistake-words">{mistakes.wordIds.map(id => {
            const word = words.find(word => word.id === id);
            const labels = { meaning: "Betekenis opnieuw oefenen", combined: "Dubbel antwoord opnieuw oefenen", pinyin: "Pinyin fout", writing: "Tekenfouten", revealed: "Antwoord getoond", skipped: "Overgeslagen" };
            const reasons = [...new Set(mistakes.results.filter(result => result.wordId === id).map(result => labels[result.reason]))];
            return <li key={id}><strong>{word?.hanzi}</strong><span>{word?.pinyin} · {word?.meaningNl}</span><small>{reasons.join(" · ")}</small></li>;
          })}</ul>
          <button className="button primary-button" onClick={() => onSessionChange(createLearningSession(`mistakes:${Date.now()}`, mistakes.wordIds, "Nog oefenen", session.direction))}>Oefen mijn fouten opnieuw</button>
          <button className="button secondary-button" disabled={saved} onClick={() => { onSaveMistakes(session); setMistakesSaved(true); }}>{saved ? "Bewaard als lijst" : "Bewaar fouten als lijst"}</button>
        </section> : <p>Geen fouten om opnieuw te oefenen.</p>}
        <button className="button primary-button" onClick={restart}>Oefen deze lijst opnieuw</button>
        <button className="button secondary-button" onClick={onExit}>Terug naar Leren</button>
      </div>
    );
  }
  const word = words.find((item) => item.id === (currentResult?.answerWordId ?? pending?.answerWordId ?? exercise.wordId));
  if (!word) return <EmptyState title="Dit woord is niet beschikbaar" text="Start de daglijst opnieuw om verder te oefenen." />;
  const activeSession: LearningSession = session;
  const activeWord: Word = word;

  function previous() {
    if (activeSession.index === 0) return;
    onSessionChange({
      ...activeSession,
      index: activeSession.index - 1,
      revealed: isCombined(activeSession.results?.[activeSession.index - 1]?.direction) || activeSession.results?.[activeSession.index - 1]?.reason === "meaning",
      promptMode: "character",
      ratings: {},
    });
  }

  function next() {
    onSessionChange(advanceLearningSession(activeSession));
  }

  function switchDirection(direction: Direction) {
    if (direction === activeSession.direction) return;
    onSessionChange(changeLearningDirection(activeSession, direction));
    setSettingsOpen(false);
  }

  function shuffleRemaining() {
    const queue = [...activeSession.queue];
    const rest = queue.slice(activeSession.index + 1);
    for (let i = rest.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rest[i], rest[j]] = [rest[j], rest[i]];
    }
    queue.splice(activeSession.index + 1, rest.length, ...rest);
    onSessionChange({ ...activeSession, queue });
    setSettingsOpen(false);
  }

  const selectedListCount = activeSession.date.startsWith("review:")
    ? activeSession.date.slice("review:".length).split(",").filter(Boolean).length
    : null;

  const hanziStyle = { "--characters": Math.max([...word.hanzi].length, 1) } as React.CSSProperties;
  const promptMatches = matchingPromptWords(word, exercise.direction, words);
  const feedbackInput = currentResult?.input ?? pinyinInput;
  const feedback = currentResult?.reason !== "revealed" && pinyinCorrect === false ? pinyinFeedback(feedbackInput, promptMatches.map(candidate => candidate.pinyin)) : null;
  const literal = literalMeaning(word);
  const showLiteral = [...word.hanzi].length > 1 &&
    literal.trim().toLocaleLowerCase("nl-BE") !== word.meaningNl.trim().toLocaleLowerCase("nl-BE");
  const storedInLists = lists.some((list) => list.wordIds.includes(word.id));
  const savedBookmarkIds = lists.filter((list) => list.wordIds.includes(word.id)).map((list) => list.id);
  const bookmarkDirty = pendingBookmarkLists.length > 0 ||
    savedBookmarkIds.length !== bookmarkSelectedIds.filter((id) => lists.some((list) => list.id === id)).length ||
    savedBookmarkIds.some((id) => !bookmarkSelectedIds.includes(id));
  function saveBookmarkChanges() {
    if (!bookmarkDirty) return;
    onSaveBookmarkChanges(activeWord.id, bookmarkSelectedIds, pendingBookmarkLists);
    if (bookmarkLastTouched && bookmarkSelectedIds.includes(bookmarkLastTouched)) {
      rememberSaveList(bookmarkLastTouched);
    }
    setBookmarkOpen(false);
    setPendingBookmarkLists([]);
    setNewListName("");
  }

  return (
    <div className="page learn-page">
      <header className="session-toolbar">
        <button className="session-icon-button session-exit-button" type="button" aria-label="Sessie verlaten" title="Sessie verlaten" onClick={exitSession}>✕</button>
        <div className="session-progress" role="progressbar" aria-label="Voortgang oefensessie" aria-valuemin={0} aria-valuemax={session.queue.length} aria-valuenow={session.index + 1}>
          <div className="session-progress-track"><div className="session-progress-fill" style={{ width: `${(session.index + 1) / session.queue.length * 100}%` }} /></div>
          <span>{session.index + 1} / {session.queue.length}</span>
        </div>
        <button className="session-icon-button session-settings-button" type="button" aria-label="Instellingen" title="Sessie-instellingen" onClick={() => setSettingsOpen(true)}>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="23" height="23"><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" /><path d="m19.4 15 .1.1 1.4 1.1-1.5 2.6-1.7-.5a8.6 8.6 0 0 1-1.8 1l-.4 1.7h-3l-.4-1.7a8.4 8.4 0 0 1-1.8-1l-1.7.5-1.5-2.6 1.4-1.1a8 8 0 0 1 0-2.1l-1.4-1.1 1.5-2.6 1.7.5a8.5 8.5 0 0 1 1.8-1L12.5 7h3l.4 1.8a8.4 8.4 0 0 1 1.8 1l1.7-.5 1.5 2.6-1.4 1.1a8 8 0 0 1-.1 2Z" transform="translate(-2.1 -2)" /></svg>
        </button>
      </header>

      <section data-exercise-key={exerciseKey(session)} data-writing-hanzi={!session.revealed && exercise.direction.endsWith("zh") && (!combined || !pending?.writingMistakes) ? word.hanzi : undefined} className={`flashcard ${combined ? "combined-card" : ""} ${session.revealed ? "revealed" : ""}`}>
        <div className="flashcard-meta">
          <button className="card-bookmark-button" type="button" aria-label="Bewaren in lijst" title="Bewaren in lijst" aria-pressed={storedInLists} onClick={openBookmarkSheet}>
            <MonoIcon name={storedInLists ? "bookmark-filled" : "bookmark"} size={20} />
          </button>
          <span className="flashcard-hsk-tag">{levelLabel(word.level, word.custom)}</span>
        </div>
        <div className="flashcard-scroll">
          {(session.revealed || exercise.direction.startsWith("zh-")) && (
            <div className="prompt-mode-toggle" aria-label="Weergave van het Chinese woord">
              <button type="button" className={session.promptMode === "character" ? "active" : ""}
                onClick={() => onSessionChange({ ...session, promptMode: "character" })}>Karakter</button>
              <button type="button" className={session.promptMode === "strokes" ? "active" : ""}
                onClick={() => onSessionChange({ ...session, promptMode: "strokes" })}>Schrijfvolgorde</button>
            </div>
          )}
          {!session.revealed ? (
            <>
              <p className="card-instruction">{directionLabels[exercise.direction]}</p>
              {exercise.direction.startsWith("zh-")
                ? (session.promptMode === "character" ? <div key={exercise.direction} className="prompt-hanzi" data-tone-colors={needsPinyin && !settings.toneHints ? "off" : undefined} style={hanziStyle}>{word.hanzi}</div> : <StrokeOrderPreview hanzi={word.hanzi} />)
                : <div className="prompt-meaning">{promptValue(word, exercise.direction)}</div>}
              {(needsPinyin || needsMeaning) && <form id="practice-answer-form" className="pinyin-answer-form" onSubmit={event => {
                event.preventDefault();
                if ((needsPinyin && !pinyinInput.trim()) || (needsMeaning && !meaningInput.trim())) return;
                if (combined) {
                  if (needsWriting && !pending?.writingMistakes) {
                    pinyinInputRef.current?.blur();
                    return;
                  }
                  const updated = recordOutcome(true, "combined");
                  if (updated) onSessionChange({ ...updated, revealed: true });
                  return;
                }
                if (needsMeaning) {
                  const match = promptMatches.find(candidate => checkMeaning(meaningInput, candidate));
                  const updated = recordOutcome(!!match, "meaning", { meaning: meaningInput, meaningCorrect: !!match, answerWordId: match?.id });
                  if (updated) onSessionChange({ ...updated, revealed: true });
                  return;
                }
                const updated = recordOutcome(checkPinyinAnswer(pinyinInput, word, exercise.direction, words), "pinyin", { input: pinyinInput });
                if (updated) onSessionChange({ ...updated, revealed: true });
              }}>
                {needsMeaning && <>
                  <label htmlFor="meaning-answer">NL</label>
                  <input id="meaning-answer" ref={meaningInputRef} autoFocus={!combined} placeholder="Typ de Nederlandse betekenis" lang="nl" aria-label="Nederlandse betekenis" value={meaningInput}
                    onChange={event => saveAnswerDraft(pinyinInput, pending?.writingMistakes, event.target.value)} autoComplete="off" />
                </>}
                {needsPinyin && <>
                {combined && <label htmlFor="pinyin-answer">拼音</label>}
                <input autoFocus={!combined} ref={pinyinInputRef} aria-label="Pinyinantwoord" id="pinyin-answer" value={pinyinInput} onChange={event => setPinyinInput(event.target.value)} autoComplete="off" autoCapitalize="none" spellCheck={false} />
                <div className="pinyin-tone-toolbar" role="group" aria-label="Toon toepassen">
                  {["M5 12H23", "M7 19L21 5", "M5 7L14 21L23 7", "M7 5L21 19"].map((path, index) => <button key={index} type="button" aria-label={`Toon ${index + 1}`} title={`Toon ${index + 1}`} onMouseDown={event => event.preventDefault()} onClick={() => editPinyin(index + 1)}><svg className="pinyin-tone-icon" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={path} /></svg></button>)}
                  <button type="button" aria-label="Trema toepassen" title="Trema toepassen" onMouseDown={event => event.preventDefault()} onClick={() => editPinyin("ü")}><svg className="pinyin-tone-icon" viewBox="0 0 28 28" fill="currentColor" aria-hidden="true"><circle cx="8" cy="14" r="3.5" /><circle cx="20" cy="14" r="3.5" /></svg></button>
                  <button type="button" className="pinyin-neutral-button" aria-label="Neutrale toon" title="Toon verwijderen" onMouseDown={event => event.preventDefault()} onClick={() => editPinyin(5)}><svg className="pinyin-tone-icon" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><circle cx="14" cy="14" r="8" /><path d="M5 23L23 5" /></svg></button>
                </div>
                </>}
                {!combined && <button className="button primary-button" type="submit" disabled={!(needsMeaning ? meaningInput : pinyinInput).trim()}>Controleer antwoord</button>}
              </form>}
              {combined && <>
                {needsWriting && <div className="combined-writing" onPointerDown={() => pinyinInputRef.current?.blur()}>
                  <strong>汉字</strong>
                  {pending?.writingMistakes
                    ? <p role="status">✓ {word.hanzi}</p>
                    : <div className="combined-writing-target" />}
                </div>}
                <button className="button primary-button" type="submit" form="practice-answer-form"
                  disabled={Boolean((needsPinyin && !pinyinInput.trim()) || (needsMeaning && !meaningInput.trim()) || (needsWriting && !pending?.writingMistakes))}>Controleer beide antwoorden</button>
              </>}
              <button className="button primary-button reveal-button" onClick={() => { const updated = recordOutcome(false, "revealed"); if (updated) onSessionChange({ ...updated, revealed: true }); }}>Toon het antwoord</button>
            </>
          ) : (
            <div className="answer-block">
              {(currentResult?.reason === "meaning" || currentResult?.reason === "combined") && needsMeaning && <p role="status">
                {currentResult.meaningCorrect ? "✓ NL correct" : `✕ NL: ${currentResult.meaning} · verwacht: ${word.meaningNl}`}
              </p>}
              {currentResult?.reason === "combined" && needsWriting && <p role="status">
                {writingIsAccepted(currentResult.writingMistakes || []) ? "✓ 汉字 correct" : "✕ 汉字 fout"}
              </p>}
              {currentResult?.reason === "writing" && <p role="status">{currentResult.correct ? "✓ 汉字 correct" : "✕ 汉字 fout"}</p>}
              {currentResult?.reason !== "revealed" && pinyinCorrect === true && <p className="pinyin-feedback-correct" role="status">{combined ? "✓ Pinyin correct" : "✓ Correct!"}</p>}
              {feedback && <section className="pinyin-feedback-error" role="status" aria-label="Antwoord verbeteren">
                <p>Jouw antwoord: <b>{feedbackInput}</b></p>
                <p>Juiste antwoord: <b>{feedback.expected}</b></p>
                <ul>{feedback.details.map((detail,index) => <li key={index}>{detail}</li>)}</ul>
              </section>}
              {promptMatches.length > 1 && <details><summary>Geldige opgeslagen antwoorden</summary>{promptMatches.map(candidate => <p key={candidate.id}>{candidate.hanzi} · {candidate.pinyin} · {candidate.meaningNl}</p>)}</details>}
              {session.promptMode === "strokes"
                ? <StrokeOrderPreview hanzi={word.hanzi} />
                : <div className="answer-hanzi" style={hanziStyle}>{word.hanzi}</div>}
              <div className="answer-pronunciation">
                <span className="answer-pinyin">{word.pinyin}</span>
                <button className="answer-audio-button" type="button" aria-label="Uitspraak afspelen" title="Uitspraak afspelen" onClick={() => speakMandarin(word.hanzi, settings.speechRate)}><MonoIcon name="speaker" size={20} /></button>
              </div>
              <div className="answer-meaning">{word.meaningNl}</div>
              {showLiteral && <p className="answer-literal">Letterlijk: {literal}</p>}
              <WordExampleCard word={word} speechRate={settings.speechRate} compact />
            </div>
          )}
        </div>
      </section>

      <nav className="session-bottom-nav" aria-label="Kaartnavigatie">
        <button className="session-nav-button session-nav-prev" type="button" onClick={() => navigateWithInputFocus(previous)} disabled={session.index === 0} aria-label="Vorige kaart" title="Vorige kaart">‹</button>
        <span className="session-bottom-counter">{session.index + 1} / {session.queue.length}</span>
        <button className="session-nav-button session-nav-next" type="button" onClick={() => navigateWithInputFocus(next)} aria-label="Volgende kaart" title="Volgende kaart">›</button>
      </nav>

      {bookmarkOpen && (
        <div className="session-sheet-backdrop" onClick={cancelBookmarkChanges}>
          <section className="session-sheet session-bookmark-sheet" role="dialog" aria-modal="true" aria-labelledby="bookmark-sheet-title" onClick={(event) => event.stopPropagation()}>
            <div className="session-sheet-handle" aria-hidden="true" />
            <div className="session-sheet-heading">
              <h2 id="bookmark-sheet-title">Bewaren in lijst</h2>
              <div className="bookmark-sheet-actions">
                <button type="button" className="session-icon-button bookmark-save-button" aria-label="Opslaan" title="Opslaan en sluiten" disabled={!bookmarkDirty} onClick={saveBookmarkChanges}>
                  <MonoIcon name="save" size={21} />
                </button>
                <button type="button" className="session-icon-button" aria-label="Terug zonder opslaan" title="Terug zonder opslaan" onClick={cancelBookmarkChanges}>✕</button>
              </div>
            </div>
            <p className="session-sheet-label">Selecteer een of meerdere lijsten voor {word.hanzi}.</p>
            <div className="bookmark-list-options">
              {[...lists, ...pendingBookmarkLists].map((list) => (
                <label key={list.id}>
                  <input
                    type="checkbox"
                    checked={bookmarkSelectedIds.includes(list.id)}
                    onChange={(event) => {
                      setBookmarkSelectedIds((current) => event.target.checked
                        ? [...current, list.id]
                        : current.filter((id) => id !== list.id));
                      setBookmarkLastTouched(list.id);
                    }}
                  />
                  <span>{list.name}</span>
                </label>
              ))}
              {lists.length === 0 && pendingBookmarkLists.length === 0 && <p>Je hebt nog geen eigen lijsten.</p>}
            </div>
            <form className="bookmark-new-list" onSubmit={(event) => {
              event.preventDefault();
              const name = newListName.trim();
              if (!name) return;
              const alreadyNamed = [...lists, ...pendingBookmarkLists].some((list) => list.name.toLocaleLowerCase("nl-BE") === name.toLocaleLowerCase("nl-BE"));
              if (alreadyNamed) return;
              const pending = createCustomList([], name)[0];
              setPendingBookmarkLists((current) => [...current, pending]);
              setBookmarkSelectedIds((current) => [...current, pending.id]);
              setBookmarkLastTouched(pending.id);
              setNewListName("");
            }}>
              <input value={newListName} onChange={(event) => setNewListName(event.target.value)} placeholder="Naam nieuwe lijst" aria-label="Naam nieuwe lijst" />
              <button type="submit" disabled={!newListName.trim()}>+ Nieuwe lijst</button>
            </form>
            {bookmarkDirty && <p className="bookmark-unsaved-hint" role="status">Niet-opgeslagen wijzigingen</p>}
          </section>
        </div>
      )}

      {settingsOpen && (
        <div className="session-sheet-backdrop" onClick={() => setSettingsOpen(false)}>
          <section className="session-sheet" role="dialog" aria-modal="true" aria-labelledby="session-sheet-title" onClick={(event) => event.stopPropagation()}>
            <div className="session-sheet-handle" aria-hidden="true" />
            <div className="session-sheet-heading">
              <h2 id="session-sheet-title">Sessie-instellingen</h2>
              <button className="session-icon-button" type="button" aria-label="Sluit instellingen" onClick={() => setSettingsOpen(false)}>✕</button>
            </div>
            <details><summary>Resultaten per richting in deze reeks</summary>
              {directions.map(direction => {
                const scores = session.wordIds.map(id => progress[id]?.directions?.[direction]);
                const correct = scores.reduce((sum, score) => sum + (score?.correct || 0), 0);
                const incorrect = scores.reduce((sum, score) => sum + (score?.incorrect || 0), 0);
                return <p key={direction}>{directionLabels[direction]}: {correct} goed · {incorrect} fout</p>;
              })}
            </details>
            <p className="session-sheet-label">Oefenrichting</p>
            <div className="direction-indicator" aria-label="Vertaalrichting van deze oefening">
              {directions.map(direction => <button key={direction} type="button" className={session.direction === direction ? "active" : ""} onClick={() => switchDirection(direction)}>{directionLabels[direction]}</button>)}
            </div>
            <div className="session-sheet-info">
              <span>{selectedListCount !== null ? "Geselecteerde daglijsten" : "Reeks"}</span>
              <strong>{selectedListCount !== null ? selectedListCount : (session.title || "Daglijst")}</strong>
            </div>
            <button type="button" className="session-shuffle-button" onClick={shuffleRemaining} disabled={session.index >= session.queue.length - 2}>Schud resterende woorden</button>
          </section>
        </div>
      )}
    </div>
  );
}

function PronunciationRecorder() {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (audioUrl) URL.revokeObjectURL(audioUrl);
  }, [audioUrl]);

  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("Opnemen wordt niet ondersteund door deze browser.");
      return;
    }
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(URL.createObjectURL(new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" })));
        stream.getTracks().forEach((track) => track.stop());
      };
      recorder.start();
      setRecording(true);
    } catch {
      setError("Geef microfoontoegang om je uitspraak op te nemen.");
    }
  }

  function stopRecording() {
    recorderRef.current?.stop();
    setRecording(false);
  }

  return (
    <div className="pronunciation-recorder">
      <button type="button" className={`button secondary-button ${recording ? "recording" : ""}`} onClick={recording ? stopRecording : startRecording}>
        {recording ? "■ Stop opname" : "● Neem je uitspraak op"}
      </button>
      {audioUrl && <audio controls src={audioUrl} />}
      {error && <small>{error}</small>}
    </div>
  );
}

function SkillRating({ label, value, onRate }: { label: string; value?: boolean; onRate: (value: boolean) => void }) {
  return (
    <div className="skill-rating">
      <span>{label}</span>
      <div>
        <button className={value === false ? "selected no" : ""} onClick={() => onRate(false)} aria-label={`${label} niet gekend`}>×</button>
        <button className={value === true ? "selected yes" : ""} onClick={() => onRate(true)} aria-label={`${label} gekend`}>✓</button>
      </div>
    </div>
  );
}

type SentenceCard = {
  id: string;
  wordId: number;
  level: HskLevel;
  word: string;
  chinese: string;
  pinyin: string;
  dutch: string;
  grammar?: string;
  gloss?: string;
};
type SentencePracticeState = {
  direction: Direction;
  queue: string[];
  index: number;
  revealed: boolean;
  known: number;
  missed: number;
  results: Record<string, boolean>;
};
const sentenceCards: SentenceCard[] = words
  .filter((word) => !word.custom)
  .flatMap((word) => curatedExamplesForWord(word).map((example, index) => ({
    id: `${word.id}:${index}`,
    wordId: word.id,
    level: word.level,
    word: word.hanzi,
    ...example,
  })));
const sentenceById = new Map(sentenceCards.map((sentence) => [sentence.id, sentence]));
const SENTENCE_PRACTICE_KEY = "chinees.sentence-practice.v1";

function shuffleSentenceCards(cards: SentenceCard[]) {
  const result = [...cards];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function restoreSentencePractice(): SentencePracticeState | null {
  try {
    const saved = localStorage.getItem(SENTENCE_PRACTICE_KEY);
    if (!saved) return null;
    const value = JSON.parse(saved) as SentencePracticeState;
    if (!Array.isArray(value.queue) || !value.queue.length || value.queue.some((id) => !sentenceById.has(id))) return null;
    if (!Number.isInteger(value.index) || value.index < 0 || value.index > value.queue.length) return null;
    if (value.direction !== "zh-nl" && value.direction !== "nl-zh") return null;
    return { ...value, results: value.results || {}, known: value.known || 0, missed: value.missed || 0, revealed: Boolean(value.revealed) };
  } catch {
    return null;
  }
}

function SentencePractice({ speechRate, dailySets }: { speechRate: number; dailySets: DailySetMap }) {
  const [direction, setDirection] = useState<Direction>("zh-nl");
  const [count, setCount] = useState("10");
  const [level, setLevel] = useState<HskLevel | "all">("all");
  const [onlyLearned, setOnlyLearned] = useState(false);
  const learnedWordIds = new Set(Object.values(dailySets).flatMap((set) => set.wordIds));
  const available = sentenceCards.filter((card) => (level === "all" || card.level === level)
    && (!onlyLearned || learnedWordIds.has(card.wordId)));
  const requestedCount = Number(count);
  const validCount = Number.isInteger(requestedCount) && requestedCount >= 1;
  const sessionCount = validCount ? Math.min(requestedCount, available.length) : 0;
  const [session, setSession] = useState<SentencePracticeState | null>(restoreSentencePractice);
  const [showDetails, setShowDetails] = useState(false);
  const [writingCharacter, setWritingCharacter] = useState<string | null>(null);

  useEffect(() => {
    if (session) localStorage.setItem(SENTENCE_PRACTICE_KEY, JSON.stringify(session));
    else localStorage.removeItem(SENTENCE_PRACTICE_KEY);
  }, [session]);

  function startSession() {
    if (!sessionCount) return;
    const shuffled = shuffleSentenceCards(available);
    const limit = sessionCount;
    setSession({ direction, queue: shuffled.slice(0, limit).map((item) => item.id),
      index: 0, revealed: false, known: 0, missed: 0, results: {} });
    setShowDetails(false);
    setWritingCharacter(null);
  }

  function recordAnswer(correct: boolean) {
    if (!session || !session.revealed) return;
    const id = session.queue[session.index];
    const prior = session.results[id];
    setSession({ ...session, index: session.index + 1, revealed: false,
      known: session.known - (prior === true ? 1 : 0) + (correct ? 1 : 0),
      missed: session.missed - (prior === false ? 1 : 0) + (correct ? 0 : 1),
      results: { ...session.results, [id]: correct } });
    setShowDetails(false);
    setWritingCharacter(null);
  }

  const current = session && session.index < session.queue.length
    ? sentenceById.get(session.queue[session.index])
    : null;
  const completed = session && session.index >= session.queue.length;
  return (
    <div className="sentence-practice-page">
      <header className="sentence-practice-heading">
        <p className="eyebrow">Oefenen</p>
        <h1>Voorbeeldzinnen</h1>
      </header>
      {!session && (
        <section className="sentence-practice-panel">
          <fieldset className="sentence-practice-fieldset">
            <legend>Oefenrichting</legend>
            <label><input type="radio" name="sentence-direction" checked={direction === "zh-nl"} onChange={() => setDirection("zh-nl")} /> Chinees → Nederlands</label>
            <label><input type="radio" name="sentence-direction" checked={direction === "nl-zh"} onChange={() => setDirection("nl-zh")} /> Nederlands → Chinees</label>
          </fieldset>
          <fieldset className="sentence-practice-fieldset">
            <legend>HSK-niveau</legend>
            <select aria-label="HSK-niveau" value={level} onChange={(event) => setLevel(event.target.value === "all" ? "all" : event.target.value === "7-9" ? "7-9" : Number(event.target.value) as HskLevel)}>
              <option value="all">Alle niveaus</option>
              {hskLevels.map((item) => <option key={item} value={item}>{levelLabel(item)}</option>)}
            </select>
          </fieldset>
          <fieldset className="sentence-practice-fieldset">
            <legend>Woorden</legend>
            <label><input type="checkbox" checked={onlyLearned} onChange={(event) => setOnlyLearned(event.target.checked)} /> Enkel reeds geleerde woorden</label>
            {onlyLearned && <small>Woorden die voorkomen in minstens één daglijst onder Leren.</small>}
          </fieldset>
          <fieldset className="sentence-practice-fieldset">
            <legend>Aantal zinnen</legend>
            <input aria-label="Aantal zinnen" aria-describedby="sentence-maximum" type="number" min={1} max={available.length} step={1} value={count}
              disabled={!available.length} onChange={(event) => setCount(event.target.value)} />
            <span id="sentence-maximum" role="status">Maximum: {available.length}</span>
          </fieldset>
          {!available.length && <p role="status">{onlyLearned ? "Geen gecureerde voorbeeldzinnen voor geleerde woorden binnen dit HSK-filter." : "Nog geen gecureerde voorbeeldzinnen voor dit HSK-niveau."}</p>}
          {available.length > 0 && !validCount && <p role="status">Vul een geheel aantal van minstens 1 in.</p>}
          <button type="button" className="button primary-button full-button" disabled={!sessionCount} onClick={startSession}>
            {validCount && requestedCount > available.length && available.length > 0 ? `Start met oefenen (${sessionCount} zinnen)` : "Start met oefenen"}
          </button>
        </section>
      )}
      {session && (
        <section className="sentence-practice-panel">
          <div className="sentence-practice-session-top">
            <span>{completed ? "Afgerond" : `Zin ${session.index + 1} van ${session.queue.length}`}</span>
            <button type="button" className="sentence-practice-reset" onClick={() => {
              if (window.confirm("De huidige oefensessie beëindigen?")) setSession(null);
            }}>Nieuwe sessie</button>
          </div>
          <div className="sentence-practice-progress" role="progressbar" aria-valuemin={0} aria-valuemax={session.queue.length} aria-valuenow={session.index}>
            <span style={{ width: `${(session.index / session.queue.length) * 100}%` }} />
          </div>
          {completed ? (
            <div className="sentence-practice-finished">
              <h2>Oefensessie voltooid</h2>
              <p><strong>{session.known}</strong> zinnen gekend · <strong>{session.missed}</strong> nog oefenen</p>
              <button type="button" className="button primary-button full-button" onClick={() => setSession(null)}>Nog eens oefenen</button>
            </div>
          ) : current && (
            <>
              <p className="sentence-practice-question">{session.direction === "zh-nl" ? "Wat betekent deze zin?" : "Hoe zeg je dit in het Chinees?"}</p>
              <div className={session.direction === "zh-nl" ? "sentence-practice-prompt hanzi" : "sentence-practice-prompt"}>
                {session.direction === "zh-nl" ? current.chinese : current.dutch}
              </div>
              {session.direction === "zh-nl" && (
                <button type="button" className="sentence-practice-audio" onClick={() => speakMandarin(current.chinese, speechRate)}>
                  <MonoIcon name="speaker" size={19} /> Beluister de zin
                </button>
              )}
              {!session.revealed ? (
                <button type="button" className="button primary-button full-button" onClick={() => setSession({ ...session, revealed: true })}>Toon het antwoord</button>
              ) : (
                <div className="sentence-practice-answer">
                  <div className="sentence-practice-answer-chinese" lang="zh">
                    {[...current.chinese].map((char, index) => /[\u3400-\u9fff]/.test(char)
                      ? <button type="button" key={index} className="examples-character"
                          onClick={() => setWritingCharacter(char)} aria-label={`Bekijk schrijfvolgorde van ${char}`}>{char}</button>
                      : <span key={index}>{char}</span>)}
                    <button className="sentence-practice-inline-audio" type="button"
                      onClick={() => speakMandarin(current.chinese, speechRate)} aria-label="Beluister de zin">
                      <MonoIcon name="speaker" size={20} />
                    </button>
                  </div>
                  <p className="sentence-practice-pinyin">{current.pinyin}</p>
                  <p className="sentence-practice-translation">{current.dutch}</p>
                  <button type="button" className="sentence-practice-details-toggle"
                    aria-expanded={showDetails} onClick={() => setShowDetails(!showDetails)}>
                    Grammatica en gebruik {showDetails ? "⌃" : "⌄"}
                  </button>
                  {showDetails && (
                    <div className="sentence-practice-grammar">
                      <p>{current.grammar}</p>{current.gloss && <small>{current.gloss}</small>}
                    </div>
                  )}
                  <div className="sentence-practice-rating" role="group" aria-label="Zelfbeoordeling">
                    <button type="button" onClick={() => recordAnswer(false)}>Wist ik niet</button>
                    <button type="button" onClick={() => recordAnswer(true)}>Wist ik</button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      )}
      {writingCharacter && createPortal(
        <div className="examples-modal-backdrop" onClick={() => setWritingCharacter(null)}>
          <section className="examples-writing-panel" role="dialog" aria-modal="true"
            aria-label={`Schrijfvolgorde van ${writingCharacter}`} onClick={(event) => event.stopPropagation()}>
            <button type="button" className="examples-writing-close" onClick={() => setWritingCharacter(null)} aria-label="Sluiten">×</button>
            <h3>Schrijfvolgorde · {writingCharacter}</h3>
            <StrokeOrderPreview hanzi={writingCharacter} />
          </section>
        </div>,
        document.body
      )}
    </div>
  );
}

function WordExampleCard({ word, speechRate, compact = false }: { word: Word; speechRate: number; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [writingCharacter, setWritingCharacter] = useState<string | null>(null);
  const examples = examplesForWord(word);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (writingCharacter) setWritingCharacter(null);
        else setOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, writingCharacter]);

  return (
    <>
      <button type="button" className={`examples-trigger ${compact ? "compact" : ""}`}
        onClick={() => setOpen(true)} aria-label={`Voorbeelden voor ${word.hanzi} bekijken`}>
        Voorbeelden <span aria-hidden="true">›</span>
      </button>
      {open && createPortal(
        <div className="examples-modal-backdrop" onClick={() => { setWritingCharacter(null); setOpen(false); }}>
          <section className="examples-modal" role="dialog" aria-modal="true"
            aria-label={`Voorbeelden voor ${word.hanzi}`} onClick={(event) => event.stopPropagation()}>
            <header className="examples-modal-header">
              <div><h2>Voorbeelden · {word.hanzi}</h2><span>{word.pinyin} · {word.meaningNl}</span></div>
              <button type="button" onClick={() => { setWritingCharacter(null); setOpen(false); }} aria-label="Sluiten">×</button>
            </header>
            <div className="examples-modal-body">
              {examples.map((example, index) => (
                <section className="examples-modal-item" key={`${example.chinese}-${index}`}>
                  {examples.length > 1 && <div className="examples-modal-number">Betekenis of gebruik {index + 1}{example.reading ? ` · ${example.reading}` : ""}</div>}
                  <div className="examples-modal-sentence">
                    <div className="examples-modal-hanzi" lang="zh">
                      {[...example.chinese].map((char, i) => /[\u3400-\u9fff]/.test(char)
                        ? <button type="button" className="examples-character" key={i}
                            onClick={() => setWritingCharacter(char)} aria-label={`Bekijk schrijfvolgorde van ${char}`}
                            style={{ color: (() => { const tone = example.toneNumbers?.[[...example.chinese.slice(0, i)].filter((c) => /[\u3400-\u9fff]/.test(c)).length]; return tone && tone < 5 ? `var(--tone-${tone})` : undefined; })() }}>{char}</button>
                        : <span key={i}>{char}</span>)}
                    </div>
                    <button type="button" className="examples-modal-speaker" onClick={() => speakMandarin(example.chinese, speechRate)}
                      aria-label="Luister naar deze voorbeeldzin"><MonoIcon name="speaker" size={21}/></button>
                  </div>
                  <p className="examples-modal-pinyin">{example.pinyin}</p>
                  <p className="examples-modal-translation">{example.dutch}</p>
                  {example.gloss && <p className="examples-modal-gloss">{example.gloss}</p>}
                  {example.grammar && <div className="examples-modal-grammar"><strong>Grammatica en gebruik</strong><p>{example.grammar}</p></div>}
                </section>
              ))}
            </div>
            {writingCharacter && <div className="examples-writing-overlay" onClick={() => setWritingCharacter(null)}>
              <div className="examples-writing-panel" onClick={(event) => event.stopPropagation()}>
                <button type="button" className="examples-writing-close" onClick={() => setWritingCharacter(null)} aria-label="Schrijfvolgorde sluiten">×</button>
                <h3>Schrijfvolgorde · {writingCharacter}</h3>
                <StrokeOrderPreview hanzi={writingCharacter}/>
              </div>
            </div>}
          </section>
        </div>,
        document.body
      )}
    </>
  );
}

function ArticleGuide({
  progress,
  speechRate,
  onProgress,
  onQuiz,
  onPractice,
}: {
  progress: ArticleProgressMap;
  speechRate: number;
  onProgress: (articleId: string, patch: { read?: boolean; understood?: boolean }) => void;
  onQuiz: (articleId: string, correct: boolean) => void;
  onPractice: (wordIds: number[], title: string) => void;
}) {
  const [selected, setSelected] = useState<Article | null>(null);
  const [level, setLevel] = useState<"Alles" | ArticleLevel>("Alles");
  const [kind, setKind] = useState<"Alles" | ArticleKind>("Alles");
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<number, number>>({});

  const filtered = articles.filter((item) => (
    (level === "Alles" || item.level === level)
    && (kind === "Alles" || item.kind === kind)
    && (!onlyOpen || !progress[item.id]?.understood)
  ));
  const openTopics = filtered.filter((item) => !progress[item.id]?.understood);
  const studiedTopics = filtered.filter((item) => progress[item.id]?.understood);
  const readCount = articles.filter((item) => progress[item.id]?.read).length;
  const understoodCount = articles.filter((item) => progress[item.id]?.understood).length;
  const percentage = Math.round((understoodCount / articles.length) * 100);

  function openArticle(item: Article) {
    setSelected(item);
    setExerciseAnswers({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (selected) {
    const itemProgress = progress[selected.id] || { read: false, understood: false };
    const courseExercises = exercisesForArticle(selected);
    const relatedWords = relatedWordsForArticle(selected, words);
    const currentIndex = articles.findIndex((item) => item.id === selected.id);
    const previous = articles[currentIndex - 1];
    const next = articles[currentIndex + 1];
    return (
      <article className="page article-reader">
        <button className="article-back" onClick={() => setSelected(null)}>
          <span aria-hidden="true">←</span> Alle onderwerpen
        </button>

        <header className="article-header">
          <div className="article-meta">
            <span>{selected.level}</span>
            <span>{selected.hsk}</span>
            <span>{selected.kind}</span>
            <span>{selected.minutes} min</span>
          </div>
          <div className="article-title-character" aria-hidden="true">{selected.chineseTitle}</div>
          <p className="eyebrow">Onderwerp {selected.order} van {articles.length}</p>
          <h1>{selected.title}</h1>
          <p className="article-lead">{selected.summary}</p>
        </header>

        <section className="article-body">
          <h2>Uitleg</h2>
          {selected.explanation.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </section>

        {selected.deepDive?.length ? (
          <section className="article-body deep-dive-card">
            <p className="eyebrow">Meer diepgang</p>
            <h2>Nuance en werkelijk gebruik</h2>
            {selected.deepDive.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </section>
        ) : null}

        <section className="article-body">
          <h2>Patronen</h2>
          <div className="pattern-list">
            {selected.patterns.map((pattern) => (
              <div key={pattern.formula}>
                <strong>{pattern.formula}</strong>
                <p>{pattern.meaning}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="article-body">
          <h2>Voorbeelden</h2>
          <div className="article-examples">
            {selected.examples.map((example) => (
              <div key={`${example.chinese}-${example.pinyin}`} className="article-example">
                <div>
                  <strong>{example.chinese}</strong>
                  <span>{example.pinyin}</span>
                  <p>{example.dutch}</p>
                  {example.note && <small>{example.note}</small>}
                  {example.analysis && <small className="example-analysis">{example.analysis}</small>}
                </div>
                <button
                  className="article-audio"
                  onClick={() => speakMandarin(example.chinese, speechRate)}
                  aria-label={`Luister naar ${example.chinese}`}
                >
                  ◖))
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="article-body remember-card">
          <h2>Onthoud dit</h2>
          <ul>
            {selected.remember.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>

        {selected.pitfalls?.length ? (
          <section className="article-body pitfalls-card">
            <p className="eyebrow">Vermijd deze fouten</p>
            <h2>Veelgemaakte fouten</h2>
            <ul>
              {selected.pitfalls.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </section>
        ) : null}

        {selected.practiceSteps?.length ? (
          <section className="article-body practice-plan-card">
            <p className="eyebrow">Actief verwerken</p>
            <h2>Zo oefen je dit onderwerp</h2>
            <ol>
              {selected.practiceSteps.map((item) => <li key={item}>{item}</li>)}
            </ol>
          </section>
        ) : null}

        {selected.dialogue?.length ? (
          <section className="article-body">
            <h2>Mini-dialoog</h2>
            <div className="article-dialogue">
              {selected.dialogue.map((line, index) => (
                <div key={`${line.speaker}-${index}`}>
                  <span>{line.speaker}</span>
                  <div>
                    <strong>{line.chinese}</strong>
                    <small>{line.pinyin}</small>
                    <p>{line.dutch}</p>
                  </div>
                  <button className="article-audio" onClick={() => speakMandarin(line.chinese, speechRate)} aria-label={`Luister naar ${line.chinese}`}>◖))</button>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {selected.culture?.length ? (
          <section className="article-body culture-card">
            <p className="eyebrow">Taal in context</p>
            <h2>Cultuur- en gebruiksnotitie</h2>
            {selected.culture.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </section>
        ) : null}

        {courseExercises.length ? (
          <section className="article-body">
            <h2>Controleer en herhaal</h2>
            <p className="exercise-intro">Elke les bevat meerdere vragen. Foute antwoorden kun je meteen opnieuw proberen en later opnieuw herhalen.</p>
            <div className="article-exercises">
              {courseExercises.map((exercise, exerciseIndex) => {
                const chosen = exerciseAnswers[exerciseIndex];
                const answered = chosen !== undefined;
                return (
                  <div key={exercise.question} className="article-exercise">
                    <strong>{exercise.question}</strong>
                    <div>
                      {exercise.options.map((option, optionIndex) => (
                        <button
                          key={option}
                          className={[
                            answered && optionIndex === exercise.answer ? "correct" : "",
                            answered && optionIndex === chosen && chosen !== exercise.answer ? "incorrect" : "",
                          ].filter(Boolean).join(" ")}
                          onClick={() => {
                            if (!answered) onQuiz(selected.id, optionIndex === exercise.answer);
                            setExerciseAnswers((current) => ({ ...current, [exerciseIndex]: optionIndex }));
                          }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    {answered && <p className={chosen === exercise.answer ? "exercise-good" : "exercise-try"}>{exercise.explanation}</p>}
                  </div>
                );
              })}
            </div>
            {(itemProgress.quizAttempts || 0) > 0 && (
              <p className="quiz-history">
                Over alle pogingen: <strong>{itemProgress.quizCorrect || 0} van {itemProgress.quizAttempts} juist</strong>
              </p>
            )}
          </section>
        ) : null}

        {relatedWords.length ? (
          <section className="article-body related-words">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Van theorie naar praktijk</p>
                <h2>Oefen de kernwoorden</h2>
              </div>
              <span>{relatedWords.length} woorden</span>
            </div>
            <div className="related-word-grid">
              {relatedWords.map((word) => (
                <div key={word.id}>
                  <strong>{word.hanzi}</strong>
                  <span>{word.pinyin}</span>
                  <small>{word.meaningNl}</small>
                </div>
              ))}
            </div>
            <button className="button primary-button full-button" onClick={() => onPractice(relatedWords.map((word) => word.id), selected.title)}>
              Oefen deze leswoorden <span aria-hidden="true">→</span>
            </button>
          </section>
        ) : null}

        <section className="article-check">
          <div>
            <p className="eyebrow">Jouw voortgang</p>
            <h2>Ben je mee?</h2>
          </div>
          <label className={itemProgress.read ? "checked" : ""}>
            <input
              type="checkbox"
              checked={itemProgress.read}
              onChange={(event) => onProgress(selected.id, {
                read: event.target.checked,
                understood: event.target.checked ? itemProgress.understood : false,
              })}
            />
            <span aria-hidden="true">{itemProgress.read ? "✓" : ""}</span>
            Ik heb dit gelezen
          </label>
          <label className={itemProgress.understood ? "checked understood" : ""}>
            <input
              type="checkbox"
              checked={itemProgress.understood}
              onChange={(event) => onProgress(selected.id, { understood: event.target.checked })}
            />
            <span aria-hidden="true">{itemProgress.understood ? "✓" : ""}</span>
            Ik begrijp dit concept
          </label>
        </section>

        <nav className="article-pagination" aria-label="Vorige en volgende onderwerp">
          {previous ? (
            <button onClick={() => openArticle(previous)}>
              <small>Vorige</small>
              <strong>← {previous.title}</strong>
            </button>
          ) : <span />}
          {next ? (
            <button onClick={() => openArticle(next)}>
              <small>Volgende</small>
              <strong>{next.title} →</strong>
            </button>
          ) : <span />}
        </nav>
      </article>
    );
  }

  return (
    <div className="page article-guide">
      <section className="guide-hero">
        <div>
          <p className="eyebrow">Leerlijn</p>
          <h1>Begrijp hoe Chinees werkt</h1>
          <p>Van klanken en zinsbouw tot natuurlijke gesprekken en gevorderde constructies.</p>
        </div>
        <div className="guide-progress" style={{ "--progress": `${percentage * 3.6}deg` } as React.CSSProperties}>
          <strong>{percentage}%</strong>
          <span>begrepen</span>
        </div>
      </section>

      <div className="guide-stats">
        <span><strong>{articles.length}</strong> onderwerpen</span>
        <span><strong>{readCount}</strong> gelezen</span>
        <span><strong>{understoodCount}</strong> begrepen</span>
      </div>

      <section className="guide-filters" aria-label="Filter onderwerpen">
        <div>
          <span>Niveau</span>
          <div className="filter-chips">
            {(["Alles", ...articleLevels] as const).map((item) => (
              <button key={item} className={level === item ? "active" : ""} onClick={() => setLevel(item)}>
                {item}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span>Soort</span>
          <div className="filter-chips">
            {(["Alles", ...articleKinds] as const).map((item) => (
              <button key={item} className={kind === item ? "active" : ""} onClick={() => setKind(item)}>
                {item}
              </button>
            ))}
          </div>
        </div>
        <label className="open-filter">
          <input type="checkbox" checked={onlyOpen} onChange={(event) => setOnlyOpen(event.target.checked)} />
          Toon alleen wat ik nog niet begrijp
        </label>
      </section>

      <div className="article-section-heading">
        <div>
          <p className="eyebrow">Jouw route</p>
          <h2>{openTopics.length ? `${openTopics.length} nog te bestuderen` : "Alles bestudeerd"}</h2>
        </div>
        {(level !== "Alles" || kind !== "Alles" || onlyOpen) && (
          <button onClick={() => { setLevel("Alles"); setKind("Alles"); setOnlyOpen(false); }}>Wis filters</button>
        )}
      </div>

      {openTopics.length > 0 && (
        <>
          <div className="next-topic-label">
            <span>Volgende onderwerp</span>
            <strong>{openTopics[0].order} van {articles.length}</strong>
          </div>
          <section className="article-grid open-topics-grid">
            {openTopics.map((item, index) => {
              const itemProgress = progress[item.id];
              return (
                <button className={`article-tile ${index === 0 ? "next-topic" : ""}`} key={item.id} onClick={() => openArticle(item)}>
                  <span className="article-order">{String(item.order).padStart(2, "0")}</span>
                  <span className="article-kind">{item.kind}</span>
                  <strong className="article-tile-hanzi">{item.chineseTitle}</strong>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  <span className="article-tile-footer">
                    <span>{item.level} · {item.minutes} min</span>
                    {itemProgress?.read ? <b>Gelezen</b> : <b>{index === 0 ? "Bestudeer nu →" : "Open →"}</b>}
                  </span>
                </button>
              );
            })}
          </section>
        </>
      )}

      {!onlyOpen && studiedTopics.length > 0 && (
        <details className="studied-topics">
          <summary>
            <span><strong>Bestudeerde onderwerpen</strong><small>{studiedTopics.length} onderwerpen</small></span>
            <span className="studied-chevron" aria-hidden="true">⌄</span>
          </summary>
          <section className="article-grid studied-article-grid">
            {studiedTopics.map((item) => (
              <button className="article-tile understood" key={item.id} onClick={() => openArticle(item)}>
                <span className="article-order">{String(item.order).padStart(2, "0")}</span>
                <span className="article-kind">{item.kind}</span>
                <strong className="article-tile-hanzi">{item.chineseTitle}</strong>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
                <span className="article-tile-footer">
                  <span>{item.level} · {item.minutes} min</span>
                  <b className="complete-badge">✓ Begrepen</b>
                </span>
              </button>
            ))}
          </section>
        </details>
      )}

      {!filtered.length && (
        <div className="guide-empty">
          <strong>Alles in deze selectie is begrepen.</strong>
          <p>Wis de filters om je volledige leerlijn opnieuw te bekijken.</p>
        </div>
      )}

      <section className="article-sources">
        <p className="eyebrow">Bronnen en aanpak</p>
        <h2>Zelf geschreven, inhoudelijk gecontroleerd</h2>
        <p>De Nederlandse uitleg en voorbeelden zijn voor deze app geschreven. De ordening en grammaticale dekking zijn gecontroleerd aan de hand van deze open bronnen.</p>
        {articleSources.map((source) => (
          <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
            <span><strong>{source.label}</strong><small>{source.detail}</small></span>
            <span aria-hidden="true">↗</span>
          </a>
        ))}
      </section>
    </div>
  );
}

function WordList({
  onSelect,
  onSpeak,
  onOpenSettings,
  onAddWord,
}: {
  onSelect: (word: Word) => void;
  onSpeak: (word: Word) => void;
  onOpenSettings: () => void;
  onAddWord: (input: NewCustomWord) => void;
}) {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<"all" | HskLevel | "custom">("all");
  const [showAddWord, setShowAddWord] = useState(false);
  const [legendOpen, setLegendOpen] = useState(false);
  const [newHanzi, setNewHanzi] = useState("");
  const [newPinyin, setNewPinyin] = useState("");
  const [newMeaning, setNewMeaning] = useState("");

  const filtered = useMemo(() => searchWords(words.filter((word) => (
    level === "all" || (level === "custom" ? word.custom : !word.custom && word.level === level)
  )), query), [query, level]);
  const formatter = new Intl.NumberFormat("nl-BE");
  const isFiltered = query.trim().length > 0 || level !== "all";
  const number = formatter.format(filtered.length);
  return (
    <div className="page words-page">
      <header className="words-compact-header">
        <div className="words-header-title"><span className="words-header-mark" aria-hidden="true">词</span><h1>Woorden</h1></div>
        <div className="words-header-actions">
          <button className="words-icon-button" type="button" aria-label="Instellingen" title="Instellingen" onClick={onOpenSettings}><MonoIcon name="settings" /></button>
          <button className="words-icon-button words-add-button" type="button" aria-label="Eigen woord toevoegen" title="Eigen woord toevoegen" onClick={() => setShowAddWord((value) => !value)}><MonoIcon name="plus" /></button>
        </div>
      </header>
      {showAddWord && (
        <form className="add-word-panel" onSubmit={(event) => {
          event.preventDefault();
          if (!newHanzi.trim() || !newPinyin.trim() || !newMeaning.trim()) return;
          onAddWord({ hanzi: newHanzi, pinyin: newPinyin, meaningNl: newMeaning });
        }}>
          <h2>Eigen woord toevoegen</h2>
          <input value={newHanzi} onChange={(event) => setNewHanzi(event.target.value)} placeholder="Chinees, bv. 美国" autoComplete="off" />
          <input value={newPinyin} onChange={(event) => setNewPinyin(event.target.value)} placeholder="Pinyin, bv. Měiguó" autoComplete="off" />
          <input value={newMeaning} onChange={(event) => setNewMeaning(event.target.value)} placeholder="Betekenis, bv. Amerika" autoComplete="off" />
          <button type="submit" className="button primary-button">Toevoegen</button>
        </form>
      )}
      <div className="search-box words-search-box">
        <MonoIcon name="search" size={20} />
        <input aria-label="Zoek Chinees, pinyin of betekenis" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Zoek Chinees, pinyin of betekenis" />
      </div>
      <div className="filter-chips words-filters" role="group" aria-label="HSK-filter">
        {(["all", ...hskLevels, "custom"] as const).map((item) => (
          <button type="button" aria-pressed={level === item} className={level === item ? "active" : ""} key={item} onClick={() => setLevel(item)}>
            {item === "all" ? "Alles" : item === "custom" ? "Eigen woorden" : `HSK ${item}`}
          </button>
        ))}
      </div>
      <div className="words-result-summary">
        <p aria-live="polite" className="result-count">{number} {isFiltered ? (filtered.length === 1 ? "resultaat" : "resultaten") : "woorden"}</p>
        <button type="button" className="words-info-button" aria-label="Uitleg toonkleuren" title="Uitleg toonkleuren" onClick={() => setLegendOpen(true)}><MonoIcon name="info" size={20} /></button>
      </div>
      <div className="word-list">
        {filtered.map((word) => {
          const literal = literalMeaning(word);
          const showLiteral = [...word.hanzi].length > 1 && literal.trim().toLocaleLowerCase("nl-BE") !== word.meaningNl.trim().toLocaleLowerCase("nl-BE");
          return (
            <article className="word-row" key={word.id}>
              <button className="word-main" type="button" onClick={() => onSelect(word)}>
                <span className="word-hanzi">{word.hanzi}</span>
                <span className="word-info">
                  <strong>{word.pinyin}{word.custom ? <span className="custom-word-mark" title="Eigen woord"> ⊕</span> : null}</strong>
                  <small>{word.meaningNl}</small>
                  {showLiteral && <small className="literal-preview">Letterlijk: {literal}</small>}
                </span>
              </button>
              <button className="row-audio" type="button" onClick={() => onSpeak(word)} aria-label={`Uitspraak afspelen: ${word.hanzi}`} title="Uitspraak afspelen"><MonoIcon name="speaker" size={21} /></button>
            </article>
          );
        })}
      </div>
      {legendOpen && (
        <div className="words-sheet-backdrop" onClick={() => setLegendOpen(false)}>
          <section className="words-legend-sheet" role="dialog" aria-modal="true" aria-labelledby="words-legend-title" onClick={(event) => event.stopPropagation()}>
            <div className="words-sheet-handle" aria-hidden="true" />
            <div className="words-sheet-heading"><h2 id="words-legend-title">Toonkleuren</h2><button className="words-icon-button" type="button" onClick={() => setLegendOpen(false)} aria-label="Sluiten">✕</button></div>
            <p>De kleuren tonen de uitspraaktoon van elk karakter.</p>
            {([
              ["1", "Eerste toon", "mā", "mandarin-tone-one"],
              ["2", "Tweede toon", "má", "mandarin-tone-two"],
              ["3", "Derde toon", "mǎ", "mandarin-tone-three"],
              ["4", "Vierde toon", "mà", "mandarin-tone-four"],
              ["5", "Neutrale toon", "ma", "mandarin-tone-neutral"],
            ] as const).map(([tone, name, example, color]) => (
              <div className="words-tone-row" key={tone}><span className={`words-tone-swatch ${color}`} /><strong>{name}</strong><span>{example}</span></div>
            ))}
          </section>
        </div>
      )}
    </div>
  );
}

function Writing({ words, initialWord, rate, drawingPrecision, onRate }: { words: Word[]; initialWord: Word | null; rate: number; drawingPrecision: Settings["drawingPrecision"]; onRate: (wordId: number, correct: boolean) => void }) {
  const [query, setQuery] = useState("");
  const [word, setWord] = useState<Word>(() => initialWord || words[0] || (wordsData as Word[])[0]);
  useEffect(() => {
    if (initialWord) setWord(initialWord);
  }, [initialWord]);
  const matches = query
    ? searchWords(words, query).slice(0, 8)
    : [];

  return (
    <div className="page writing-page">
      <div className="page-title-row">
        <div><p className="eyebrow">Schrijfoefening</p><h1>Schrijf met je vinger</h1></div>
      </div>
      <label className="search-box">
        <span aria-hidden="true">⌕</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Kies een woord of karakter" />
      </label>
      {matches.length > 0 && (
        <div className="writing-results">
          {matches.map((item) => (
            <button key={item.id} onClick={() => { setWord(item); setQuery(""); }}>
              <strong>{item.hanzi}</strong><span>{item.pinyin} · {item.meaningNl}</span>
            </button>
          ))}
        </div>
      )}
      <div className="writing-word-heading">
        <div>
          <strong>{word.hanzi}</strong>
          <span>{word.pinyin}</span>
          <small>{word.meaningNl}</small>
          <small className="literal-preview">Letterlijk: {literalMeaning(word)}</small>
        </div>
        <button className="audio-button compact" onClick={() => speakMandarin(word.hanzi, rate)}>◖))</button>
      </div>
      <HanziPractice
        hanzi={word.hanzi}
        precision={drawingPrecision}
        onComplete={(mistakes) => onRate(word.id, mistakes <= 1)}
      />
    </div>
  );
}

function SettingsView({
  settings,
  theme,
  onThemeChange,
  onChange,
  onToggleLevel,
  onReset,
}: {
  settings: Settings;
  theme: "light" | "dark";
  onThemeChange: (theme: "light" | "dark") => void;
  onChange: (patch: Partial<Settings>) => void;
  onToggleLevel: (level: HskLevel) => void;
  onReset: () => void;
}) {
  return (
    <div className="page settings-page">
      <div className="page-title-row"><div><p className="eyebrow">Persoonlijk</p><h1>Instellingen</h1></div></div>
      <section className="settings-card"><h2>Weergave</h2><div className="appearance-choices"><button type="button" className={theme === "light" ? "active" : ""} onClick={() => onThemeChange("light")}>Licht</button><button type="button" className={theme === "dark" ? "active" : ""} onClick={() => onThemeChange("dark")}>Donker</button></div>
        <label className="tone-hint-setting">
          <strong>Toonhint</strong>
          <input type="checkbox" role="switch" checked={settings.toneHints} onChange={event => onChange({ toneHints: event.target.checked })} />
        </label>
      </section>
      <section className="settings-card">
        <h2>Actieve niveaus</h2>
        <div className="level-selector left">
          {hskLevels.map((level) => (
            <button className={settings.levels.includes(level as HskLevel) ? "active" : ""} key={level} onClick={() => onToggleLevel(level as HskLevel)}>
              HSK {level}
            </button>
          ))}
        </div>
      </section>
      <section className="settings-card">
        <label>
          <span><strong>Uitspraaksnelheid</strong><small>{Math.round(settings.speechRate * 100)}%</small></span>
          <input type="range" min="0.5" max="1" step="0.05" value={settings.speechRate} onChange={(event) => onChange({ speechRate: Number(event.target.value) })} />
        </label>
      </section>
      <section className="settings-card">
        <h2>Tekennauwkeurigheid</h2>
        <div className="precision-options" role="group" aria-label="Tekennauwkeurigheid">
          {([
            ["relaxed", "Soepel"],
            ["normal", "Normaal"],
            ["precise", "Precies"],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={settings.drawingPrecision === value ? "active" : ""}
              onClick={() => onChange({ drawingPrecision: value })}
            >
              {label}
            </button>
          ))}
        </div>
      </section>
      <section className="settings-card about-card">
        <h2>Installeren op je gsm</h2>
        <p><strong>iPhone:</strong> open de site in Safari, tik op Delen en kies ‘Zet op beginscherm’.</p>
        <p><strong>Android:</strong> open het browsermenu en kies ‘App installeren’.</p>
      </section>
      <section className="settings-card about-card">
        <h2>Over deze woordenlijst</h2>
        <p>Nieuwe HSK-standaard: 300 woorden in HSK 1, 200 nieuwe in HSK 2, 500 in HSK 3, 1.000 in HSK 4, 1.600 in HSK 5, 1.800 in HSK 6 en ongeveer 5.600 in de gezamenlijke gevorderdenband HSK 7-9.</p>
      </section>
      <button className="danger-button" onClick={onReset}>Wis alle leerresultaten</button>
    </div>
  );
}

function WordSheet({
  word,
  progress,
  speechRate,
  lists,
  onToggleWord,
  onClose,
  onWrite,
  onNotesChange,
}: {
  word: Word;
  progress: ReturnType<typeof emptyWordProgress>;
  speechRate: number;
  lists: CustomWordList[];
  onToggleWord: (listId: string, wordId: number) => void;
  onClose: () => void;
  onWrite: () => void;
  onNotesChange: (notes: string) => void;
}) {
  const hanziStyle = { "--characters": Math.max([...word.hanzi].length, 1) } as React.CSSProperties;
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <article className="word-sheet" onClick={(event) => event.stopPropagation()}>
        <button className="sheet-close" onClick={onClose} aria-label="Sluiten">×</button>
        <span className="level-chip">{levelLabel(word.level)}</span>
        <div className="sheet-hanzi" style={hanziStyle}>{word.hanzi}</div>
        <div className="sheet-pinyin">{word.pinyin}</div>
        <div className="sheet-meaning">{word.meaningNl}</div>
        <div className="literal-meaning sheet-literal"><span>Letterlijk</span>{literalMeaning(word)}</div>
        <p className="word-type">{word.wordType}</p>
        <button className="audio-button" onClick={() => speakMandarin(word.hanzi, speechRate)}>◖)) Luister</button>
        <WordExampleCard word={word} speechRate={speechRate} />
        {lists.length > 0 && (
          <details className="word-sheet-lists">
            <summary>Toevoegen aan mijn lijsten</summary>
            {lists.map((list) => (
              <label key={list.id}><input type="checkbox" checked={list.wordIds.includes(word.id)} onChange={() => onToggleWord(list.id, word.id)} /> {list.name}</label>
            ))}
          </details>
        )}
        <div className="skill-summary">
          <SkillSummary label="Betekenis" status={progress.meaning.status} />
          <SkillSummary label="Uitspraak" status={progress.pronunciation.status} />
          <SkillSummary label="Schrijfwijze" status={progress.writing.status} />
        </div>
        <label className="notes-field">
          <span>Eigen geheugensteun of voorbeeldzin</span>
          <textarea
            value={progress.notes}
            onChange={(event) => onNotesChange(event.target.value)}
            placeholder="Bijvoorbeeld: 爱好 = houden van + goed"
            rows={3}
          />
        </label>
        <button className="button primary-button full-button" onClick={onWrite}>Oefen de schrijfwijze</button>
      </article>
    </div>
  );
}

function SkillSummary({ label, status }: { label: string; status: string }) {
  const names: Record<string, string> = { new: "Nieuw", learning: "Bezig", known: "Gekend" };
  return <div><span>{label}</span><strong className={status}>{names[status]}</strong></div>;
}

function DailySetSheet({
  set,
  settings,
  onClose,
  onPractice,
  onSelect,
}: {
  set: DailySet;
  settings: Settings;
  onClose: () => void;
  onPractice: (direction: Direction) => void;
  onSelect: (word: Word) => void;
}) {
  const dayWords = set.wordIds.map((id) => words.find((word) => word.id === id)).filter((word): word is Word => Boolean(word));
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <article className="word-sheet daily-set-sheet" onClick={(event) => event.stopPropagation()}>
        <button className="sheet-close" onClick={onClose} aria-label="Sluiten">×</button>
        <p className="eyebrow">Daglijst</p>
        <h2>{formatDailyDate(set.date)}</h2>
        <p className="daily-set-meta">{dayWords.length} woorden · HSK {set.levels.join(", ")}</p>
        <div className="daily-set-practice">
          <button className="button primary-button full-button" onClick={() => onPractice(settings.direction)}>
            Oefenen <span aria-hidden="true">▶</span>
          </button>
        </div>
        <div className="daily-set-words">
          {dayWords.map((word, index) => (
            <button key={word.id} onClick={() => onSelect(word)}>
              <span>{index + 1}</span>
              <strong>{word.hanzi}</strong>
              <span><b>{word.pinyin}</b><small>{word.meaningNl}</small></span>
              <span aria-hidden="true">›</span>
            </button>
          ))}
        </div>
      </article>
    </div>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return <div className="page empty-state"><div className="hero-character">学</div><h1>{title}</h1><p>{text}</p></div>;
}

export default App;
