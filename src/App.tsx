import { useEffect, useMemo, useState } from "react";
import wordsData from "./data/words.json";
import { literalGlosses } from "./data/literalGlosses";
import HanziPractice, { StrokeOrderPreview } from "./components/HanziPractice";
import { emptyWordProgress, loadProgress, loadSettings, saveProgress, saveSettings, updateSkill } from "./lib/progress";
import { wordMatchesSearch } from "./lib/search";
import { speakMandarin } from "./lib/speech";
import type { Direction, HskLevel, ProgressMap, Skill, Word } from "./types";

type Tab = "home" | "learn" | "words" | "write" | "settings";

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
  { id: "words", label: "Woorden", icon: "词" },
  { id: "write", label: "Schrijven", icon: "写" },
  { id: "settings", label: "Instellingen", icon: "⚙" },
];

const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

function levelLabel(level: HskLevel) {
  return `HSK ${level}`;
}

function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [progress, setProgress] = useState<ProgressMap>(() => loadProgress());
  const [settings, setSettings] = useState<Settings>(() => loadSettings(defaultSettings));
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [writingWord, setWritingWord] = useState<Word | null>(null);
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);

  useEffect(() => saveProgress(progress), [progress]);
  useEffect(() => saveSettings(settings), [settings]);

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
            onStart={() => setTab("learn")}
            onWrite={() => setTab("write")}
            onToggleLevel={toggleLevel}
          />
        )}
        {tab === "learn" && (
          <Learn
            key={`${settings.levels.join("-")}-${settings.direction}`}
            words={levelWords}
            progress={progress}
            settings={settings}
            onSettings={updateSettings}
            onRate={rate}
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
              if (window.confirm("Wil je alle lokale leerresultaten verwijderen?")) setProgress({});
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
    </div>
  );
}

function Home({
  stats,
  settings,
  onStart,
  onWrite,
  onToggleLevel,
}: {
  stats: { total: number; known: number; learning: number; newCount: number; reviews: number };
  settings: Settings;
  onStart: () => void;
  onWrite: () => void;
  onToggleLevel: (level: HskLevel) => void;
}) {
  const percentage = stats.total ? Math.round((stats.known / stats.total) * 100) : 0;
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
            <h2>{stats.reviews ? `${stats.reviews} woorden wachten` : "Klaar voor een nieuwe reeks"}</h2>
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
    </div>
  );
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
  words,
  progress,
  settings,
  onSettings,
  onRate,
}: {
  words: Word[];
  progress: ProgressMap;
  settings: Settings;
  onSettings: (patch: Partial<Settings>) => void;
  onRate: (id: number, skill: Skill, correct: boolean) => void;
}) {
  const [queue] = useState(() => {
    const now = Date.now();
    return shuffle(words).sort((a, b) => {
      const aProgress = progress[a.id];
      const bProgress = progress[b.id];
      const aDue = aProgress ? Math.min(aProgress.meaning.dueAt, aProgress.pronunciation.dueAt) : 0;
      const bDue = bProgress ? Math.min(bProgress.meaning.dueAt, bProgress.pronunciation.dueAt) : 0;
      return Number(aDue > now) - Number(bDue > now);
    });
  });
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [promptMode, setPromptMode] = useState<"character" | "strokes">("character");
  const [ratings, setRatings] = useState<Partial<Record<Skill, boolean>>>({});
  const word = queue[index % Math.max(queue.length, 1)];

  if (!word) return <EmptyState title="Kies minstens één niveau" text="Activeer een HSK-niveau bij Instellingen." />;

  function answer(skill: Skill, correct: boolean) {
    onRate(word.id, skill, correct);
    setRatings((current) => ({ ...current, [skill]: correct }));
  }

  function next() {
    setIndex((current) => current + 1);
    setRevealed(false);
    setPromptMode("character");
    setRatings({});
  }

  const requiredRated = ratings.meaning !== undefined && ratings.pronunciation !== undefined && ratings.writing !== undefined;
  const hanziStyle = { "--characters": Math.max([...word.hanzi].length, 1) } as React.CSSProperties;

  return (
    <div className="page learn-page">
      <div className="page-title-row">
        <div>
          <p className="eyebrow">Oefensessie</p>
          <h1>{index + 1} <span>van {Math.min(settings.dailyGoal, queue.length)}</span></h1>
        </div>
        <span className="level-chip">{levelLabel(word.level)}</span>
      </div>

      <div className="segmented-control">
        <button className={settings.direction === "zh-nl" ? "active" : ""} onClick={() => onSettings({ direction: "zh-nl" })}>
          Chinees → Nederlands
        </button>
        <button className={settings.direction === "nl-zh" ? "active" : ""} onClick={() => onSettings({ direction: "nl-zh" })}>
          Nederlands → Chinees
        </button>
      </div>

      <section className={`flashcard ${revealed ? "revealed" : ""}`}>
        <p className="card-instruction">
          {settings.direction === "zh-nl" ? "Wat betekent dit woord?" : "Hoe schrijf en spreek je dit uit?"}
        </p>
        {settings.direction === "zh-nl" ? (
          <>
            <div className="prompt-mode-toggle" aria-label="Weergave van het Chinese woord">
              <button className={promptMode === "character" ? "active" : ""} onClick={() => setPromptMode("character")}>Karakter</button>
              <button className={promptMode === "strokes" ? "active" : ""} onClick={() => setPromptMode("strokes")}>Schrijfvolgorde</button>
            </div>
            {promptMode === "character"
              ? <div className="prompt-hanzi" style={hanziStyle}>{word.hanzi}</div>
              : <StrokeOrderPreview hanzi={word.hanzi} />}
          </>
        ) : <div className="prompt-meaning">{word.meaningNl}</div>}

        {!revealed ? (
          <button className="button primary-button reveal-button" onClick={() => setRevealed(true)}>
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

      {revealed && (
        <section className="self-check">
          <p>Wat kende je?</p>
          <SkillRating label="Betekenis" value={ratings.meaning} onRate={(value) => answer("meaning", value)} />
          <SkillRating label="Uitspraak" value={ratings.pronunciation} onRate={(value) => answer("pronunciation", value)} />
          <SkillRating label="Schrijfwijze" value={ratings.writing} onRate={(value) => answer("writing", value)} />
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
  const filtered = useMemo(() => words.filter((word) => {
    const matches = wordMatchesSearch(word, query);
    return matches && (level === "all" || word.level === level);
  }), [query, level]);

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
    ? words.filter((item) => wordMatchesSearch(item, query)).slice(0, 8)
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

function EmptyState({ title, text }: { title: string; text: string }) {
  return <div className="page empty-state"><div className="hero-character">学</div><h1>{title}</h1><p>{text}</p></div>;
}

export default App;
