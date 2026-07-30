import { useEffect, useMemo, useRef, useState } from "react";
import { wordsData } from "./data/words";
import { literalGlosses } from "./data/literalGlosses";
import { articleKinds, articleLevels, articleSources, articles, type Article, type ArticleKind, type ArticleLevel } from "./data/articles";
import HanziPractice from "./components/HanziPractice";
import { loadArticleProgress, recordArticleQuiz, saveArticleProgress, updateArticleProgress, type ArticleProgressMap } from "./lib/articleProgress";
import { createCustomList, loadCustomLists, saveCustomLists, toggleWordInList, type CustomWordList } from "./lib/customLists";
import { blankSentence, checkActiveAnswer, choiceOptions, exerciseInstruction, inputPlaceholder, sentenceTokens } from "./lib/activeExercises";
import { exercisesForArticle, relatedWordsForArticle } from "./lib/course";
import { clearDailySets, createDailySet, loadDailySets, localDateKey, saveDailySets, type DailySet, type DailySetMap } from "./lib/dailySets";
import { answerExercise, createLearningSession, loadLearningSession, saveLearningSession, sessionMatches, type LearningSession } from "./lib/learningSession";
import { isArticleUnlocked, learningRecommendation, loadLearningPath, needsTheoryReview, placementQuestions, prerequisiteFor, resultForPlacement, saveLearningPath, type LearningPathState } from "./lib/learningPath";
import { emptyWordProgress, loadProgress, loadSettings, saveProgress, saveSettings, updateSkill } from "./lib/progress";
import { searchWords } from "./lib/search";
import { speakMandarin } from "./lib/speech";
import { exampleForWord } from "./lib/wordExamples";
import type { Direction, HskLevel, ProgressMap, Skill, Word } from "./types";

type Tab = "home" | "learn" | "guide" | "words" | "write" | "settings";

interface Settings {
  levels: HskLevel[];
  direction: Direction;
  dailyGoal: number;
  speechRate: number;
}

const words = wordsData as Word[];
const hskLevels: HskLevel[] = [1, 2, 3, 4, 5, 6, "7-9"];
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
  levels: [1],
  direction: "zh-nl",
  dailyGoal: 15,
  speechRate: 0.72,
};

const navItems: { id: Tab; label: string; icon: string }[] = [
  { id: "home", label: "Vandaag", icon: "⌂" },
  { id: "learn", label: "Leren", icon: "学" },
  { id: "guide", label: "Leerpad", icon: "文" },
  { id: "words", label: "Woorden", icon: "词" },
  { id: "write", label: "Schrijven", icon: "写" },
  { id: "settings", label: "Instellingen", icon: "⚙" },
];

function levelLabel(level: HskLevel) {
  return `HSK ${level}`;
}

function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [progress, setProgress] = useState<ProgressMap>(() => loadProgress());
  const [settings, setSettings] = useState<Settings>(() => loadSettings(defaultSettings));
  const [dailySets, setDailySets] = useState<DailySetMap>(() => loadDailySets());
  const [articleProgress, setArticleProgress] = useState<ArticleProgressMap>(() => loadArticleProgress());
  const [customLists, setCustomLists] = useState<CustomWordList[]>(() => loadCustomLists());
  const [learningSession, setLearningSession] = useState<LearningSession | null>(() => loadLearningSession());
  const [learningPath, setLearningPath] = useState<LearningPathState>(() => loadLearningPath());
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [theoryReturnArticleId, setTheoryReturnArticleId] = useState<string | null>(null);
  const [wordReturnArticleId, setWordReturnArticleId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<DailySet | null>(null);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [writingWord, setWritingWord] = useState<Word | null>(null);
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);

  useEffect(() => saveProgress(progress), [progress]);
  useEffect(() => saveSettings(settings), [settings]);
  useEffect(() => saveDailySets(dailySets), [dailySets]);
  useEffect(() => saveArticleProgress(articleProgress), [articleProgress]);
  useEffect(() => saveCustomLists(customLists), [customLists]);
  useEffect(() => saveLearningSession(learningSession), [learningSession]);
  useEffect(() => saveLearningPath(learningPath), [learningPath]);

  useEffect(() => {
    const listener = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    window.addEventListener("beforeinstallprompt", listener);
    return () => window.removeEventListener("beforeinstallprompt", listener);
  }, []);

  const levelWords = useMemo(
    () => words.filter((word) => settings.levels.includes(word.level)),
    [settings.levels],
  );

  useEffect(() => {
    setDailySets((current) => createDailySet(current, levelWords, settings.levels, settings.dailyGoal, progress));
  }, [levelWords, progress, settings.dailyGoal, settings.levels]);

  const todaySet = dailySets[localDateKey()];
  const todayWords = useMemo(
    () => (todaySet?.wordIds || []).map((id) => words.find((word) => word.id === id)).filter((word): word is Word => Boolean(word)),
    [todaySet],
  );
  useEffect(() => {
    if (!todaySet || !todayWords.length) return;
    setLearningSession((current) => (
      current || createLearningSession(todaySet.date, todaySet.wordIds, "vandaag")
    ));
  }, [todaySet, todayWords.length]);
  const dailyHistory = useMemo(
    () => Object.values(dailySets).sort((a, b) => b.date.localeCompare(a.date)),
    [dailySets],
  );
  const todayCompleted = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    return todayWords.filter((word) => {
      const item = progress[word.id];
      return item
        && (item.meaning.lastReviewedAt || 0) >= startOfToday.getTime()
        && (item.pronunciation.lastReviewedAt || 0) >= startOfToday.getTime()
        && (item.writing.lastReviewedAt || 0) >= startOfToday.getTime();
    }).length;
  }, [progress, todayWords]);

  const stats = useMemo(() => {
    const available = words.filter((word) => settings.levels.includes(word.level));
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

  function rate(wordId: number, skill: Skill, correct: boolean) {
    setProgress((current) => updateSkill(current, wordId, skill, correct));
  }

  function startToday() {
    if (!todaySet?.wordIds.length) return;
    setTheoryReturnArticleId(null);
    setLearningSession((current) => (
      sessionMatches(current, todaySet.date, todaySet.wordIds)
        ? current
        : createLearningSession(todaySet.date, todaySet.wordIds, "vandaag")
    ));
    setTab("learn");
  }

  function startDailySetReview(sets: DailySet[]) {
    const sortedSets = [...sets].sort((a, b) => a.date.localeCompare(b.date));
    const wordIds = [...new Set(sortedSets.flatMap((set) => set.wordIds))];
    if (!wordIds.length) return;
    setTheoryReturnArticleId(null);
    const dates = sortedSets.map((set) => set.date);
    const title = sortedSets.length === 1
      ? formatDailyDate(sortedSets[0].date).toLocaleLowerCase("nl-BE")
      : `${sortedSets.length} geselecteerde dagen`;
    setLearningSession(createLearningSession(`review:${dates.join(",")}`, wordIds, title));
    setSelectedDay(null);
    setTab("learn");
  }

  function startWordList(wordIds: number[], title: string) {
    if (!wordIds.length) return;
    setLearningSession(createLearningSession(`list:${Date.now()}`, wordIds, title));
    setTab("learn");
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setTab("home")} aria-label="Ga naar vandaag">
          <span className="brand-mark">中</span>
          <span>
            <strong>Chinees</strong>
            <small>HSK 1 · 2 · 3 · 4 · 5 · 6 · 7-9</small>
          </span>
        </button>
        {installPrompt && <button className="install-button" onClick={installApp}>Installeer</button>}
      </header>

      <main>
        {tab === "home" && (
          <Home
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
          />
        )}
        {tab === "learn" && (
          <Learn
            session={learningSession}
            settings={settings}
            onSessionChange={setLearningSession}
            onRate={rate}
            returnArticle={theoryReturnArticleId ? articles.find((article) => article.id === theoryReturnArticleId) || null : null}
            onReturnToTheory={() => {
              setSelectedArticleId(theoryReturnArticleId);
              setTheoryReturnArticleId(null);
              setTab("guide");
            }}
          />
        )}
        {tab === "guide" && (
          <ArticleGuide
            progress={articleProgress}
            wordProgress={progress}
            learningPath={learningPath}
            selectedId={selectedArticleId}
            speechRate={settings.speechRate}
            onSelect={setSelectedArticleId}
            onLearningPathChange={setLearningPath}
            onPractice={(wordIds, title, articleId) => {
              setTheoryReturnArticleId(articleId);
              startWordList(wordIds, title);
            }}
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
            progress={progress}
            lists={customLists}
            returnArticle={wordReturnArticleId ? articles.find((article) => article.id === wordReturnArticleId) || null : null}
            onReturnToTheory={() => {
              setSelectedArticleId(wordReturnArticleId);
              setWordReturnArticleId(null);
              setTab("guide");
            }}
            onSelect={setSelectedWord}
            onSpeak={(word) => speakMandarin(word.hanzi, settings.speechRate)}
            onCreateList={(name) => setCustomLists((current) => createCustomList(current, name))}
            onDeleteList={(listId) => setCustomLists((current) => current.filter((list) => list.id !== listId))}
            onToggleWord={(listId, wordId) => setCustomLists((current) => toggleWordInList(current, listId, wordId))}
            onPracticeList={(list) => startWordList(list.wordIds, list.name)}
          />
        )}
        {tab === "write" && (
          <Writing
            words={levelWords}
            initialWord={writingWord}
            rate={settings.speechRate}
            onRate={(wordId, correct) => rate(wordId, "writing", correct)}
          />
        )}
        {tab === "settings" && (
          <SettingsView
            settings={settings}
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

      <nav className="bottom-nav" aria-label="Hoofdnavigatie">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={tab === item.id ? "active" : ""}
            onClick={() => {
              if (item.id !== "learn") setTheoryReturnArticleId(null);
              if (item.id === "words" && tab === "guide" && selectedArticleId) {
                setWordReturnArticleId(selectedArticleId);
              } else if (item.id !== "words") {
                setWordReturnArticleId(null);
              }
              setTab(item.id);
            }}
            aria-current={tab === item.id ? "page" : undefined}
          >
            <span aria-hidden="true">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {selectedWord && (
        <WordSheet
          word={selectedWord}
          progress={progress[selectedWord.id] || emptyWordProgress()}
          speechRate={settings.speechRate}
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
          onClose={() => setSelectedDay(null)}
          onPractice={() => startDailySetReview([selectedDay])}
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
  onStart: () => void;
  onPracticeDays: (sets: DailySet[]) => void;
  onWrite: () => void;
  onToggleLevel: (level: HskLevel) => void;
  onOpenDay: (set: DailySet) => void;
}) {
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const percentage = todayWords.length ? Math.round((todayCompleted / todayWords.length) * 100) : 0;
  const selectedSets = history.filter((set) => selectedDates.includes(set.date));
  const selectedWordCount = new Set(selectedSets.flatMap((set) => set.wordIds)).size;
  const allSelected = history.length > 0 && selectedDates.length === history.length;

  function toggleDay(date: string) {
    setSelectedDates((current) => (
      current.includes(date)
        ? current.filter((item) => item !== date)
        : [...current, date]
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
        <button className="button primary-button full-button" onClick={onStart}>
          Start met leren <span aria-hidden="true">→</span>
        </button>
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
              onClick={() => setSelectedDates(allSelected ? [] : history.map((set) => set.date))}
            >
              {allSelected ? "Wis selectie" : "Selecteer alles"}
            </button>
          )}
        </div>
        <div className="daily-history-list">
          {history.map((set) => {
            const dayWords = set.wordIds.map((id) => words.find((word) => word.id === id)).filter((word): word is Word => Boolean(word));
            const selected = selectedDates.includes(set.date);
            return (
              <div className={`daily-history-row ${selected ? "selected" : ""}`} key={set.date}>
                <button
                  className="daily-day-select"
                  onClick={() => toggleDay(set.date)}
                  aria-pressed={selected}
                  aria-label={`${formatDailyDate(set.date)} ${selected ? "uit selectie verwijderen" : "selecteren"}`}
                >
                  <span className="daily-check" aria-hidden="true">{selected ? "✓" : ""}</span>
                  <span>
                    <strong>{formatDailyDate(set.date)}</strong>
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
        {selectedSets.length > 0 && (
          <div className="daily-practice-selection">
            <span>
              <strong>{selectedSets.length} {selectedSets.length === 1 ? "dag" : "dagen"} geselecteerd</strong>
              <small>{selectedWordCount} unieke woorden · beide richtingen</small>
            </span>
            <button className="button primary-button" onClick={() => onPracticeDays(selectedSets)}>
              Opnieuw oefenen <span aria-hidden="true">→</span>
            </button>
          </div>
        )}
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

function Learn({
  session,
  settings,
  onSessionChange,
  onRate,
  returnArticle,
  onReturnToTheory,
}: {
  session: LearningSession | null;
  settings: Settings;
  onSessionChange: (session: LearningSession) => void;
  onRate: (id: number, skill: Skill, correct: boolean) => void;
  returnArticle: Article | null;
  onReturnToTheory: () => void;
}) {
  const [input, setInput] = useState("");
  const [selectedChoice, setSelectedChoice] = useState("");
  const [orderedTokenIds, setOrderedTokenIds] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const exercise = session?.queue[session.index];

  useEffect(() => {
    setInput("");
    setSelectedChoice("");
    setOrderedTokenIds([]);
    setSubmitted(false);
    setCorrect(false);
  }, [session?.index, exercise?.retryCount]);

  function restart() {
    if (!session) return;
    onSessionChange(createLearningSession(session.date, session.wordIds, session.title));
  }

  if (!session?.queue.length) return <EmptyState title="Je daglijst wordt klaargezet" text="Ga even terug naar Vandaag en open de leersessie opnieuw." />;
  if (!exercise) {
    const attempts = session.correctCount + session.incorrectCount;
    const accuracy = attempts ? Math.round((session.correctCount / attempts) * 100) : 0;
    return (
      <div className="page daily-complete">
        <div className="hero-character">好</div>
        <p className="eyebrow">Oefensessie voltooid</p>
        <h1>Goed gewerkt</h1>
        <p>Je oefende {session.wordIds.length} woorden uit {session.title || "deze reeks"} met actieve vragen.</p>
        <div className="session-result-grid">
          <span><strong>{accuracy}%</strong> juist</span>
          <span><strong>{session.correctCount}</strong> goed</span>
          <span><strong>{session.retriedCount}</strong> herhaald</span>
        </div>
        {returnArticle && (
          <button className="button secondary-button" onClick={onReturnToTheory}>
            ← Terug naar {returnArticle.title}
          </button>
        )}
        <button className="button primary-button" onClick={restart}>Oefen deze lijst opnieuw</button>
      </div>
    );
  }
  const word = words.find((item) => item.id === exercise.wordId);
  if (!word) return <EmptyState title="Dit woord is niet beschikbaar" text="Start de daglijst opnieuw om verder te oefenen." />;
  const activeSession: LearningSession = session;
  const activeWord: Word = word;
  const activeExercise = exercise;
  const skillLabels: Record<Skill, string> = {
    meaning: "Betekenis",
    pronunciation: "Uitspraak",
    writing: "Schrijfwijze",
  };
  const hanziStyle = { "--characters": Math.max([...word.hanzi].length, 1) } as React.CSSProperties;
  const meaningLanguageLabel = word.meaningLanguage === "en" ? "Engels" : "Nederlands";
  const choices = choiceOptions(exercise, word, words);
  const example = exampleForWord(word);
  const tokenSet = sentenceTokens(word, words);
  const orderedTokens = orderedTokenIds
    .map((id) => tokenSet.shuffled.find((token) => token.id === id))
    .filter((token): token is { id: string; token: string } => Boolean(token));
  const isChoice = exercise.kind === "meaning-choice" || exercise.kind === "listening-choice";
  const isOrdering = exercise.kind === "sentence-order";
  const canSubmit = isChoice
    ? Boolean(selectedChoice)
    : isOrdering
      ? orderedTokenIds.length === tokenSet.shuffled.length
      : Boolean(input.trim());

  function submitAnswer(event?: React.FormEvent) {
    event?.preventDefault();
    if (!canSubmit || submitted) return;
    const answerIsCorrect = isChoice
      ? selectedChoice === String(activeWord.id)
      : isOrdering
        ? orderedTokens.map((token) => token.token).join("") === tokenSet.ordered.join("")
        : checkActiveAnswer(activeExercise, activeWord, input);
    setCorrect(answerIsCorrect);
    setSubmitted(true);
    onRate(activeWord.id, activeExercise.skill, answerIsCorrect);
  }

  function next() {
    if (!submitted) return;
    onSessionChange(answerExercise(activeSession, correct));
  }

  function renderPrompt() {
    if (activeExercise.kind === "listening-choice" || activeExercise.kind === "dictation") {
      return (
        <div className="listening-prompt">
          <button className="listening-button" onClick={() => speakMandarin(activeWord.hanzi, settings.speechRate)} aria-label="Speel het Chinese woord af">
            <span aria-hidden="true">◖))</span>
          </button>
          <strong>Speel het woord af</strong>
          <small>Je kunt zo vaak luisteren als nodig.</small>
        </div>
      );
    }
    if (activeExercise.kind === "hanzi-input") return <div className="prompt-meaning">{activeWord.meaningNl}</div>;
    if (activeExercise.kind === "fill-blank") {
      return (
        <div className="context-prompt">
          <strong>{blankSentence(activeWord)}</strong>
          <span>{example.dutch}</span>
        </div>
      );
    }
    if (activeExercise.kind === "sentence-order" || activeExercise.kind === "translation-input") {
      return (
        <div className="context-prompt">
          <strong>{example.dutch}</strong>
          <span>Bouw de Chinese zin.</span>
        </div>
      );
    }
    return <div className="prompt-hanzi" style={hanziStyle}>{activeWord.hanzi}</div>;
  }

  return (
    <div className="page learn-page">
      {returnArticle && (
        <button className="theory-return" onClick={onReturnToTheory}>
          <span aria-hidden="true">←</span> Terug naar theorie: {returnArticle.title}
        </button>
      )}
      <div className="page-title-row">
        <div>
          <p className="eyebrow">Oefensessie · {session.title || "daglijst"}</p>
          <h1>{session.index + 1} <span>van {session.queue.length}</span></h1>
        </div>
        <span className="level-chip">{levelLabel(word.level)}</span>
      </div>

      <div className="direction-indicator" aria-label="Vertaalrichting van deze oefening">
        <span className={exercise.direction === "zh-nl" ? "active" : ""}>
          Chinees → {meaningLanguageLabel}
        </span>
        <span className={exercise.direction === "nl-zh" ? "active" : ""}>
          {meaningLanguageLabel} → Chinees
        </span>
      </div>
      <p className="skill-focus">Focus: <strong>{skillLabels[exercise.skill]}</strong></p>

      <section className={`flashcard active-exercise ${submitted ? "revealed" : ""}`}>
        <p className="card-instruction">{exerciseInstruction(exercise.kind, meaningLanguageLabel.toLowerCase())}</p>
        {renderPrompt()}

        {!submitted && (
          <form className="active-answer" onSubmit={submitAnswer}>
            {isChoice && (
              <div className="answer-options">
                {choices.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={selectedChoice === option.value ? "selected" : ""}
                    onClick={() => setSelectedChoice(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
            {isOrdering && (
              <div className="sentence-builder">
                <div className="sentence-answer" aria-label="Jouw Chinese zin">
                  {orderedTokens.length
                    ? orderedTokens.map((token) => (
                      <button
                        type="button"
                        key={token.id}
                        onClick={() => setOrderedTokenIds((current) => current.filter((id) => id !== token.id))}
                      >
                        {token.token}
                      </button>
                    ))
                    : <span>Tik hieronder de zinsdelen aan</span>}
                </div>
                <div className="sentence-pool">
                  {tokenSet.shuffled.map((token) => (
                    <button
                      type="button"
                      key={token.id}
                      disabled={orderedTokenIds.includes(token.id)}
                      onClick={() => setOrderedTokenIds((current) => [...current, token.id])}
                    >
                      {token.token}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {!isChoice && !isOrdering && (
              <input
                className="active-input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={inputPlaceholder(exercise.kind)}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
              />
            )}
            {exercise.kind === "pinyin-input" && <PronunciationRecorder />}
            <button type="submit" className="button primary-button full-button" disabled={!canSubmit}>
              Controleer mijn antwoord
            </button>
          </form>
        )}

        {submitted && (
          <div className="answer-block">
            <div className={`answer-result ${correct ? "correct" : "incorrect"}`}>
              <strong>{correct ? "Juist" : "Nog niet juist"}</strong>
              <span>{correct ? "Mooi. Dit antwoord telt mee." : "Deze vraag komt later in de sessie opnieuw terug."}</span>
            </div>
            <div className="answer-hanzi" style={hanziStyle}>{word.hanzi}</div>
            <div className="answer-pinyin">{word.pinyin}</div>
            <div className="answer-meaning">{word.meaningNl}</div>
            <div className="literal-meaning"><span>Letterlijk</span>{literalMeaning(word)}</div>
            <button className="audio-button" onClick={() => speakMandarin(word.hanzi, settings.speechRate)}>
              <span aria-hidden="true">◖))</span> Luister
            </button>
            <WordExampleCard word={word} speechRate={settings.speechRate} compact />
            {exercise.kind === "translation-input" && (
              <div className="translation-answer">
                <span>Modelantwoord</span>
                <strong>{example.chinese}</strong>
                <small>{example.pinyin}</small>
              </div>
            )}
          </div>
        )}
      </section>

      {submitted && (
        <section className="active-next">
          <button className="button primary-button full-button" onClick={next}>
            {correct ? "Volgende oefening" : "Verder, later opnieuw"} <span aria-hidden="true">→</span>
          </button>
        </section>
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

function WordExampleCard({ word, speechRate, compact = false }: { word: Word; speechRate: number; compact?: boolean }) {
  const example = exampleForWord(word);
  return (
    <div className={`word-example ${compact ? "compact" : ""}`}>
      <div>
        <small>Voorbeeldzin</small>
        <strong>{example.chinese}</strong>
        <span>{example.pinyin}</span>
        <p>{example.dutch}</p>
      </div>
      <button onClick={() => speakMandarin(example.chinese, speechRate)} aria-label={`Luister naar ${example.chinese}`}>◖))</button>
    </div>
  );
}

function ArticleGuide({
  progress,
  wordProgress,
  learningPath,
  selectedId,
  speechRate,
  onSelect,
  onLearningPathChange,
  onProgress,
  onQuiz,
  onPractice,
}: {
  progress: ArticleProgressMap;
  wordProgress: ProgressMap;
  learningPath: LearningPathState;
  selectedId: string | null;
  speechRate: number;
  onSelect: (articleId: string | null) => void;
  onLearningPathChange: (path: LearningPathState) => void;
  onProgress: (articleId: string, patch: { read?: boolean; understood?: boolean }) => void;
  onQuiz: (articleId: string, correct: boolean) => void;
  onPractice: (wordIds: number[], title: string, articleId: string) => void;
}) {
  const [level, setLevel] = useState<"Alles" | ArticleLevel>("Alles");
  const [kind, setKind] = useState<"Alles" | ArticleKind>("Alles");
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<number, number>>({});
  const [showPlacement, setShowPlacement] = useState(false);
  const selected = selectedId ? articles.find((item) => item.id === selectedId) || null : null;
  const recommendation = useMemo(
    () => learningRecommendation(articles, progress, wordProgress, words, learningPath),
    [progress, wordProgress, learningPath],
  );
  const reviewIds = useMemo(
    () => new Set(articles
      .filter((article) => needsTheoryReview(article, progress, wordProgress, words))
      .map((article) => article.id)),
    [progress, wordProgress],
  );

  const filtered = articles.filter((item) => (
    (level === "Alles" || item.level === level)
    && (kind === "Alles" || item.kind === kind)
    && (!onlyOpen || !progress[item.id]?.understood)
  ));
  const readCount = articles.filter((item) => progress[item.id]?.read).length;
  const understoodCount = articles.filter((item) => progress[item.id]?.understood).length;
  const percentage = Math.round((understoodCount / articles.length) * 100);

  useEffect(() => {
    if (!selectedId) return;
    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.querySelector("main")?.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [selectedId]);

  function openArticle(item: Article) {
    setExerciseAnswers({});
    onSelect(item.id);
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
        <button className="article-back" onClick={() => onSelect(null)}>
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
            <button className="button primary-button full-button" onClick={() => onPractice(relatedWords.map((word) => word.id), selected.title, selected.id)}>
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
      <section className="learning-path-card">
        <div className="learning-path-heading">
          <div>
            <p className="eyebrow">Jouw persoonlijke leerpad</p>
            <h1>{recommendation?.review ? "Tijd om gericht te herhalen" : "Dit is je volgende stap"}</h1>
          </div>
          <span className={recommendation?.review ? "review" : ""}>{recommendation?.review ? "Herhaling" : "Aanbevolen"}</span>
        </div>
        {recommendation ? (
          <button className="recommendation-card" onClick={() => openArticle(recommendation.article)}>
            <span className="recommendation-order">{String(recommendation.article.order).padStart(2, "0")}</span>
            <span>
              <small>{recommendation.article.level} · {recommendation.article.kind}</small>
              <strong>{recommendation.article.title}</strong>
              <p>{recommendation.reason}</p>
            </span>
            <b aria-hidden="true">→</b>
          </button>
        ) : (
          <div className="path-complete">
            <strong>Je hebt de volledige leerlijn begrepen.</strong>
            <span>Zwakke onderdelen verschijnen hier automatisch opnieuw zodra oefeningen daar aanleiding toe geven.</span>
          </div>
        )}
        <div className="placement-summary">
          {learningPath.placement ? (
            <span>
              <small>Instaptest</small>
              <strong>{learningPath.placement.label} · {learningPath.placement.correct}/{learningPath.placement.total} juist</strong>
            </span>
          ) : (
            <span>
              <small>Nog geen instaptest</small>
              <strong>Laat de app je beste startpunt bepalen</strong>
            </span>
          )}
          <button onClick={() => setShowPlacement(true)}>
            {learningPath.placement ? "Opnieuw testen" : "Start instaptest"}
          </button>
        </div>
      </section>

      {showPlacement && (
        <PlacementTest
          onCancel={() => setShowPlacement(false)}
          onComplete={(result) => {
            onLearningPathChange({ ...learningPath, placement: result });
            setShowPlacement(false);
          }}
        />
      )}

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
          <h2>{filtered.length} onderwerpen</h2>
        </div>
        {(level !== "Alles" || kind !== "Alles" || onlyOpen) && (
          <button onClick={() => { setLevel("Alles"); setKind("Alles"); setOnlyOpen(false); }}>Wis filters</button>
        )}
      </div>

      <section className="article-grid">
        {filtered.map((item) => {
          const itemProgress = progress[item.id];
          const prerequisite = prerequisiteFor(item, articles);
          const unlocked = isArticleUnlocked(item, articles, progress, learningPath);
          const review = reviewIds.has(item.id);
          const recommended = recommendation?.article.id === item.id;
          return (
            <button
              className={[
                "article-tile",
                itemProgress?.understood ? "understood" : "",
                review ? "needs-review" : "",
                recommended ? "recommended" : "",
              ].filter(Boolean).join(" ")}
              key={item.id}
              onClick={() => openArticle(item)}
            >
              <span className="article-order">{String(item.order).padStart(2, "0")}</span>
              <span className="article-kind">{review ? "Herhalen" : recommended ? "Aanbevolen" : item.kind}</span>
              <strong className="article-tile-hanzi">{item.chineseTitle}</strong>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
              {!unlocked && prerequisite && (
                <small className="prerequisite-note">Eerst aanbevolen: {prerequisite.title}</small>
              )}
              <span className="article-tile-footer">
                <span>{item.level} · {item.minutes} min</span>
                {itemProgress?.understood
                  ? <b className="complete-badge">✓ Begrepen</b>
                  : itemProgress?.read
                    ? <b>Gelezen</b>
                    : <b>Open →</b>}
              </span>
            </button>
          );
        })}
      </section>

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

function PlacementTest({
  onCancel,
  onComplete,
}: {
  onCancel: () => void;
  onComplete: (result: ReturnType<typeof resultForPlacement>) => void;
}) {
  const questions = useMemo(() => placementQuestions(articles), []);
  const [index, setIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const question = questions[index];

  if (!question) return null;
  const answered = selectedOption !== null;
  const correct = selectedOption === question.exercise.answer;

  function choose(optionIndex: number) {
    if (answered) return;
    setSelectedOption(optionIndex);
    setAnswers((current) => [...current, optionIndex === question.exercise.answer]);
  }

  function nextQuestion() {
    if (!answered) return;
    if (index === questions.length - 1) {
      onComplete(resultForPlacement(answers.filter(Boolean).length, questions.length, articles.length));
      return;
    }
    setIndex((current) => current + 1);
    setSelectedOption(null);
  }

  return (
    <section className="placement-test" aria-label="Instaptest">
      <div className="placement-test-header">
        <button onClick={onCancel} aria-label="Sluit instaptest">×</button>
        <span>Vraag {index + 1} van {questions.length}</span>
        <div><i style={{ width: `${((index + 1) / questions.length) * 100}%` }} /></div>
      </div>
      <p className="eyebrow">{question.level} · {question.articleTitle}</p>
      <h2>{question.exercise.question}</h2>
      <div className="placement-options">
        {question.exercise.options.map((option, optionIndex) => (
          <button
            key={option}
            disabled={answered}
            className={[
              answered && optionIndex === question.exercise.answer ? "correct" : "",
              answered && optionIndex === selectedOption && !correct ? "incorrect" : "",
            ].filter(Boolean).join(" ")}
            onClick={() => choose(optionIndex)}
          >
            {option}
          </button>
        ))}
      </div>
      {answered && (
        <div className={`placement-feedback ${correct ? "correct" : "incorrect"}`}>
          <strong>{correct ? "Juist" : "Niet juist"}</strong>
          <span>{question.exercise.explanation}</span>
        </div>
      )}
      <button className="button primary-button full-button" disabled={!answered} onClick={nextQuestion}>
        {index === questions.length - 1 ? "Bekijk mijn instapniveau" : "Volgende vraag"} <span aria-hidden="true">→</span>
      </button>
    </section>
  );
}

function WordList({
  progress,
  lists,
  returnArticle,
  onReturnToTheory,
  onSelect,
  onSpeak,
  onCreateList,
  onDeleteList,
  onToggleWord,
  onPracticeList,
}: {
  progress: ProgressMap;
  lists: CustomWordList[];
  returnArticle: Article | null;
  onReturnToTheory: () => void;
  onSelect: (word: Word) => void;
  onSpeak: (word: Word) => void;
  onCreateList: (name: string) => void;
  onDeleteList: (listId: string) => void;
  onToggleWord: (listId: string, wordId: number) => void;
  onPracticeList: (list: CustomWordList) => void;
}) {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<"all" | HskLevel>("all");
  const [newListName, setNewListName] = useState("");
  const [selectedListId, setSelectedListId] = useState("");
  const [onlySelectedList, setOnlySelectedList] = useState(false);
  const selectedList = lists.find((list) => list.id === selectedListId);
  const filtered = useMemo(
    () => searchWords(words.filter((word) => (
      (level === "all" || word.level === level)
      && (!onlySelectedList || !selectedList || selectedList.wordIds.includes(word.id))
    )), query),
    [query, level, onlySelectedList, selectedList],
  );

  return (
    <div className="page words-page">
      {returnArticle && (
        <button className="theory-return" onClick={onReturnToTheory}>
          <span aria-hidden="true">←</span> Terug naar theorie: {returnArticle.title}
        </button>
      )}
      <div className="page-title-row">
        <div><p className="eyebrow">Naslagwerk</p><h1>11.005 woorden</h1></div>
      </div>
      <section className="custom-lists">
        <div className="section-heading">
          <div><p className="eyebrow">Eigen selectie</p><h2>Mijn woordenlijsten</h2></div>
          {selectedList?.wordIds.length ? (
            <button className="button primary-button" onClick={() => onPracticeList(selectedList)}>Oefen lijst</button>
          ) : null}
        </div>
        <form
          className="new-list-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (!newListName.trim()) return;
            onCreateList(newListName);
            setNewListName("");
          }}
        >
          <input value={newListName} onChange={(event) => setNewListName(event.target.value)} placeholder="Naam van je nieuwe lijst" />
          <button type="submit">Maak lijst</button>
        </form>
        {lists.length ? (
          <div className="custom-list-chips">
            {lists.map((list) => (
              <button
                key={list.id}
                className={selectedListId === list.id ? "active" : ""}
                onClick={() => {
                  setSelectedListId(list.id);
                  setOnlySelectedList(false);
                }}
              >
                <strong>{list.name}</strong>
                <span>{list.wordIds.length}</span>
              </button>
            ))}
          </div>
        ) : <p className="empty-list-copy">Maak een lijst en voeg daarna woorden toe met de plusknop.</p>}
        {selectedList && (
          <div className="selected-list-actions">
            <label>
              <input type="checkbox" checked={onlySelectedList} onChange={(event) => setOnlySelectedList(event.target.checked)} />
              Toon alleen woorden uit deze lijst
            </label>
            <button
              onClick={() => {
                if (!window.confirm(`Wil je de lijst “${selectedList.name}” verwijderen?`)) return;
                onDeleteList(selectedList.id);
                setSelectedListId("");
                setOnlySelectedList(false);
              }}
            >
              Verwijder lijst
            </button>
          </div>
        )}
      </section>
      <label className="search-box">
        <span aria-hidden="true">⌕</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Zoek Chinees, pinyin of betekenis" />
      </label>
      <div className="filter-chips">
        {(["all", ...hskLevels] as const).map((item) => (
          <button className={level === item ? "active" : ""} key={item} onClick={() => setLevel(item)}>
            {item === "all" ? "Alles" : `HSK ${item}`}
          </button>
        ))}
      </div>
      <p className="result-count">{filtered.length} woorden</p>
      <div className="word-list">
        {filtered.map((word) => {
          const item = progress[word.id];
          const status = item?.meaning.status === "known" && item?.pronunciation.status === "known"
            ? "known"
            : item ? "learning" : "new";
          return (
            <article className="word-row" key={word.id}>
              <button className="word-main" onClick={() => onSelect(word)}>
                <span className="word-hanzi">{word.hanzi}</span>
                <span className="word-info">
                  <strong>{word.pinyin}</strong>
                  <small>{word.meaningNl}</small>
                  <small className="literal-preview">Letterlijk: {literalMeaning(word)}</small>
                </span>
                <span className={`status-dot ${status}`} aria-label={status} />
              </button>
              <button className="row-audio" onClick={() => onSpeak(word)} aria-label={`Luister naar ${word.hanzi}`}>◖))</button>
              {selectedList && (
                <button
                  className={`row-list-toggle ${selectedList.wordIds.includes(word.id) ? "added" : ""}`}
                  onClick={() => onToggleWord(selectedList.id, word.id)}
                  aria-label={`${word.hanzi} ${selectedList.wordIds.includes(word.id) ? "uit" : "aan"} ${selectedList.name}`}
                  title={selectedList.wordIds.includes(word.id) ? "Verwijder uit lijst" : "Voeg toe aan lijst"}
                >
                  {selectedList.wordIds.includes(word.id) ? "✓" : "+"}
                </button>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function Writing({ words, initialWord, rate, onRate }: { words: Word[]; initialWord: Word | null; rate: number; onRate: (wordId: number, correct: boolean) => void }) {
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
        onComplete={(mistakes) => onRate(word.id, mistakes <= 1)}
      />
    </div>
  );
}

function SettingsView({
  settings,
  onChange,
  onToggleLevel,
  onReset,
}: {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  onToggleLevel: (level: HskLevel) => void;
  onReset: () => void;
}) {
  return (
    <div className="page settings-page">
      <div className="page-title-row"><div><p className="eyebrow">Persoonlijk</p><h1>Instellingen</h1></div></div>
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
          <span><strong>Dagdoel</strong><small>{settings.dailyGoal} woorden per dag</small></span>
          <input type="range" min="5" max="50" step="5" value={settings.dailyGoal} onChange={(event) => onChange({ dailyGoal: Number(event.target.value) })} />
        </label>
        <label>
          <span><strong>Uitspraaksnelheid</strong><small>{Math.round(settings.speechRate * 100)}%</small></span>
          <input type="range" min="0.5" max="1" step="0.05" value={settings.speechRate} onChange={(event) => onChange({ speechRate: Number(event.target.value) })} />
        </label>
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
  onClose,
  onWrite,
  onNotesChange,
}: {
  word: Word;
  progress: ReturnType<typeof emptyWordProgress>;
  speechRate: number;
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
  onClose,
  onPractice,
  onSelect,
}: {
  set: DailySet;
  onClose: () => void;
  onPractice: () => void;
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
        <button className="button primary-button full-button daily-set-practice" onClick={onPractice}>
          Oefen deze dag opnieuw <span aria-hidden="true">→</span>
        </button>
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
