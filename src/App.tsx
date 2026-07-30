import { useEffect, useMemo, useState } from "react";
import wordsData from "./data/words.json";
import { literalGlosses } from "./data/literalGlosses";
import { articleKinds, articleLevels, articleSources, articles, type Article, type ArticleKind, type ArticleLevel } from "./data/articles";
import HanziPractice, { StrokeOrderPreview } from "./components/HanziPractice";
import { loadArticleProgress, saveArticleProgress, updateArticleProgress, type ArticleProgressMap } from "./lib/articleProgress";
import { clearDailySets, createDailySet, loadDailySets, localDateKey, saveDailySets, type DailySet, type DailySetMap } from "./lib/dailySets";
import { createLearningSession, loadLearningSession, saveLearningSession, sessionMatches, type LearningSession } from "./lib/learningSession";
import { emptyWordProgress, loadProgress, loadSettings, saveProgress, saveSettings, updateSkill } from "./lib/progress";
import { searchWords } from "./lib/search";
import { speakMandarin } from "./lib/speech";
import type { Direction, HskLevel, ProgressMap, Skill, Word } from "./types";

type Tab = "home" | "learn" | "guide" | "words" | "write" | "settings";

interface Settings {
  levels: HskLevel[];
  direction: Direction;
  dailyGoal: number;
  speechRate: number;
}

const words = wordsData as Word[];
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
  { id: "guide", label: "Theorie", icon: "文" },
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
  const [learningSession, setLearningSession] = useState<LearningSession | null>(() => loadLearningSession());
  const [selectedDay, setSelectedDay] = useState<DailySet | null>(null);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [writingWord, setWritingWord] = useState<Word | null>(null);
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);

  useEffect(() => saveProgress(progress), [progress]);
  useEffect(() => saveSettings(settings), [settings]);
  useEffect(() => saveDailySets(dailySets), [dailySets]);
  useEffect(() => saveArticleProgress(articleProgress), [articleProgress]);
  useEffect(() => saveLearningSession(learningSession), [learningSession]);

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
      : [...settings.levels, level].sort() as HskLevel[];
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
    const dates = sortedSets.map((set) => set.date);
    const title = sortedSets.length === 1
      ? formatDailyDate(sortedSets[0].date).toLocaleLowerCase("nl-BE")
      : `${sortedSets.length} geselecteerde dagen`;
    setLearningSession(createLearningSession(`review:${dates.join(",")}`, wordIds, title));
    setSelectedDay(null);
    setTab("learn");
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setTab("home")} aria-label="Ga naar vandaag">
          <span className="brand-mark">中</span>
          <span>
            <strong>Chinees</strong>
            <small>HSK 1 · 2 · 3</small>
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
          />
        )}
        {tab === "guide" && (
          <ArticleGuide
            progress={articleProgress}
            speechRate={settings.speechRate}
            onProgress={(articleId, patch) => (
              setArticleProgress((current) => updateArticleProgress(current, articleId, patch))
            )}
          />
        )}
        {tab === "words" && (
          <WordList
            progress={progress}
            onSelect={setSelectedWord}
            onSpeak={(word) => speakMandarin(word.hanzi, settings.speechRate)}
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
            onClick={() => setTab(item.id)}
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
        {[1, 2, 3].map((level) => (
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
}: {
  session: LearningSession | null;
  settings: Settings;
  onSessionChange: (session: LearningSession) => void;
  onRate: (id: number, skill: Skill, correct: boolean) => void;
}) {
  function restart() {
    if (!session) return;
    onSessionChange(createLearningSession(session.date, session.wordIds, session.title));
  }

  if (!session?.queue.length) return <EmptyState title="Je daglijst wordt klaargezet" text="Ga even terug naar Vandaag en open de leersessie opnieuw." />;
  const exercise = session.queue[session.index];
  if (!exercise) {
    return (
      <div className="page daily-complete">
        <div className="hero-character">好</div>
        <p className="eyebrow">Daglijst voltooid</p>
        <h1>Goed gewerkt</h1>
        <p>Je hebt de {session.wordIds.length} woorden van {session.title || "deze reeks"} in beide richtingen doorlopen.</p>
        <button className="button primary-button" onClick={restart}>Oefen deze lijst opnieuw</button>
      </div>
    );
  }
  const word = words.find((item) => item.id === exercise.wordId);
  if (!word) return <EmptyState title="Dit woord is niet beschikbaar" text="Start de daglijst opnieuw om verder te oefenen." />;
  const activeSession: LearningSession = session;
  const activeWord: Word = word;

  function answer(skill: Skill, correct: boolean) {
    onRate(activeWord.id, skill, correct);
    onSessionChange({
      ...activeSession,
      ratings: { ...activeSession.ratings, [skill]: correct },
    });
  }

  function next() {
    onSessionChange({
      ...activeSession,
      index: activeSession.index + 1,
      revealed: false,
      promptMode: "character",
      ratings: {},
    });
  }

  const requiredRated = session.ratings.meaning !== undefined
    && session.ratings.pronunciation !== undefined
    && session.ratings.writing !== undefined;
  const hanziStyle = { "--characters": Math.max([...word.hanzi].length, 1) } as React.CSSProperties;

  return (
    <div className="page learn-page">
      <div className="page-title-row">
        <div>
          <p className="eyebrow">Oefensessie · {session.title || "daglijst"}</p>
          <h1>{session.index + 1} <span>van {session.queue.length}</span></h1>
        </div>
        <span className="level-chip">{levelLabel(word.level)}</span>
      </div>

      <div className="direction-indicator" aria-label="Vertaalrichting van deze oefening">
        <span className={exercise.direction === "zh-nl" ? "active" : ""}>
          Chinees → Nederlands
        </span>
        <span className={exercise.direction === "nl-zh" ? "active" : ""}>
          Nederlands → Chinees
        </span>
      </div>

      <section className={`flashcard ${session.revealed ? "revealed" : ""}`}>
        <p className="card-instruction">
          {exercise.direction === "zh-nl" ? "Wat betekent dit woord?" : "Hoe schrijf en spreek je dit uit?"}
        </p>
        {exercise.direction === "zh-nl" ? (
          <>
            <div className="prompt-mode-toggle" aria-label="Weergave van het Chinese woord">
              <button
                className={session.promptMode === "character" ? "active" : ""}
                onClick={() => onSessionChange({ ...session, promptMode: "character" })}
              >
                Karakter
              </button>
              <button
                className={session.promptMode === "strokes" ? "active" : ""}
                onClick={() => onSessionChange({ ...session, promptMode: "strokes" })}
              >
                Schrijfvolgorde
              </button>
            </div>
            {session.promptMode === "character"
              ? <div className="prompt-hanzi" style={hanziStyle}>{word.hanzi}</div>
              : <StrokeOrderPreview hanzi={word.hanzi} />}
          </>
        ) : <div className="prompt-meaning">{word.meaningNl}</div>}

        {!session.revealed ? (
          <button className="button primary-button reveal-button" onClick={() => onSessionChange({ ...session, revealed: true })}>
            Toon het antwoord
          </button>
        ) : (
          <div className="answer-block">
            <div className="answer-hanzi" style={hanziStyle}>{word.hanzi}</div>
            <div className="answer-pinyin">{word.pinyin}</div>
            <div className="answer-meaning">{word.meaningNl}</div>
            <div className="literal-meaning"><span>Letterlijk</span>{literalMeaning(word)}</div>
            <button className="audio-button" onClick={() => speakMandarin(word.hanzi, settings.speechRate)}>
              <span aria-hidden="true">◖))</span> Luister
            </button>
          </div>
        )}
      </section>

      {session.revealed && (
        <section className="self-check">
          <p>Wat kende je?</p>
          <SkillRating label="Betekenis" value={session.ratings.meaning} onRate={(value) => answer("meaning", value)} />
          <SkillRating label="Uitspraak" value={session.ratings.pronunciation} onRate={(value) => answer("pronunciation", value)} />
          <SkillRating label="Schrijfwijze" value={session.ratings.writing} onRate={(value) => answer("writing", value)} />
          <button className="button primary-button full-button" disabled={!requiredRated} onClick={next}>
            Volgend woord <span aria-hidden="true">→</span>
          </button>
        </section>
      )}
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

function ArticleGuide({
  progress,
  speechRate,
  onProgress,
}: {
  progress: ArticleProgressMap;
  speechRate: number;
  onProgress: (articleId: string, patch: { read?: boolean; understood?: boolean }) => void;
}) {
  const [selected, setSelected] = useState<Article | null>(null);
  const [level, setLevel] = useState<"Alles" | ArticleLevel>("Alles");
  const [kind, setKind] = useState<"Alles" | ArticleKind>("Alles");
  const [onlyOpen, setOnlyOpen] = useState(false);

  const filtered = articles.filter((item) => (
    (level === "Alles" || item.level === level)
    && (kind === "Alles" || item.kind === kind)
    && (!onlyOpen || !progress[item.id]?.understood)
  ));
  const readCount = articles.filter((item) => progress[item.id]?.read).length;
  const understoodCount = articles.filter((item) => progress[item.id]?.understood).length;
  const percentage = Math.round((understoodCount / articles.length) * 100);

  function openArticle(item: Article) {
    setSelected(item);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (selected) {
    const itemProgress = progress[selected.id] || { read: false, understood: false };
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
          <h2>{filtered.length} onderwerpen</h2>
        </div>
        {(level !== "Alles" || kind !== "Alles" || onlyOpen) && (
          <button onClick={() => { setLevel("Alles"); setKind("Alles"); setOnlyOpen(false); }}>Wis filters</button>
        )}
      </div>

      <section className="article-grid">
        {filtered.map((item) => {
          const itemProgress = progress[item.id];
          return (
            <button className={`article-tile ${itemProgress?.understood ? "understood" : ""}`} key={item.id} onClick={() => openArticle(item)}>
              <span className="article-order">{String(item.order).padStart(2, "0")}</span>
              <span className="article-kind">{item.kind}</span>
              <strong className="article-tile-hanzi">{item.chineseTitle}</strong>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
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

function WordList({
  progress,
  onSelect,
  onSpeak,
}: {
  progress: ProgressMap;
  onSelect: (word: Word) => void;
  onSpeak: (word: Word) => void;
}) {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<"all" | HskLevel>("all");
  const filtered = useMemo(
    () => searchWords(words.filter((word) => level === "all" || word.level === level), query),
    [query, level],
  );

  return (
    <div className="page words-page">
      <div className="page-title-row">
        <div><p className="eyebrow">Naslagwerk</p><h1>1.000 woorden</h1></div>
      </div>
      <label className="search-box">
        <span aria-hidden="true">⌕</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Zoek Chinees, pinyin of Nederlands" />
      </label>
      <div className="filter-chips">
        {(["all", 1, 2, 3] as const).map((item) => (
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
          {[1, 2, 3].map((level) => (
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
        <p>Nieuwe HSK-standaard: 300 woorden in HSK 1, 200 nieuwe woorden in HSK 2 en 500 nieuwe woorden in HSK 3.</p>
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
