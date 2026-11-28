import { useEffect, useMemo, useRef, useState } from "react";
import type { CustomWordList } from "../lib/customLists";
import { loadCustomLists, saveCustomLists } from "../lib/customLists";
import { addCustomWords, cleanImportedField, loadCustomWords, type NewCustomWord } from "../lib/customWords";
import { searchWords } from "../lib/search";
import type { Word } from "../types";
import { listCollections, type ListCategory } from "../lib/listCollections";
import { directionLabels } from "../lib/practiceDirections";
import "./ListManager.css";

function splitDelimited(line: string, delimiter: string) {
  const cells: string[] = [];
  let value = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') { value += '"'; i += 1; } else quoted = !quoted;
    } else if (ch === delimiter && !quoted) { cells.push(value.trim()); value = ""; }
    else value += ch;
  }
  cells.push(value.trim());
  return cells;
}

function parseRows(text: string) {
  return text.split(/\r?\n/).map((raw) => raw.trim()).filter(Boolean).map((line) => {
    const delimiter = line.includes("\t") ? "\t" : line.includes(";") ? ";" : line.includes("|") ? "|" : line.includes(",") ? "," : "";
    if (!delimiter) return [cleanImportedField(line)].filter(Boolean);
    return splitDelimited(line, delimiter).map(cleanImportedField).filter(Boolean);
  }).filter((cells) => !/chinees|hanzi|karakter|pinyin|betekenis|vertaling|nederlands/i.test(cells.join(" ")));
}

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLocaleLowerCase();
}

function resolveRows(text: string, words: Word[]) {
  const byHanzi = new Map(words.map((word) => [word.hanzi.trim(), word.id]));
  const byPinyin = new Map(words.map((word) => [normalize(word.pinyin), word.id]));
  const found = new Set<number>();
  const newWords: NewCustomWord[] = [];
  let unmatched = 0;

  for (const cells of parseRows(text)) {
    const hanzi = cells.find((cell) => /[\u3400-\u9fff]/u.test(cell))?.trim();
    const hanziId = hanzi ? byHanzi.get(hanzi) : undefined;
    const pinyinId = cells.map((cell) => byPinyin.get(normalize(cell))).find((id): id is number => typeof id === "number");
    const existingId = hanziId ?? pinyinId;
    if (existingId !== undefined) {
      found.add(existingId);
      continue;
    }

    if (hanzi && cells.length >= 3) {
      const hanziIndex = cells.indexOf(hanzi);
      const pinyin = cells[hanziIndex + 1] || cells.find((cell) => cell !== hanzi && !/[\u3400-\u9fff]/u.test(cell)) || "";
      const meaningCells = cells.filter((_, index) => index !== hanziIndex && cells[index] !== pinyin);
      const meaningNl = meaningCells.join("; ").trim();
      if (pinyin.trim() && meaningNl) {
        newWords.push({ hanzi, pinyin: pinyin.trim(), meaningNl });
        continue;
      }
    }

    unmatched += 1;
  }

  return { ids: [...found], newWords, unmatched };
}

function ActionGlyph({ type }: { type: "play" | "import" | "export" | "trash" }) {
  const common = { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (type === "play") return <svg {...common} fill="currentColor" stroke="none"><path d="M8 5v14l11-7z" /></svg>;
  if (type === "import") return <svg {...common}><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 20h14"/></svg>;
  if (type === "export") return <svg {...common}><path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 4h14"/></svg>;
  return <svg {...common}><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v5M14 11v5"/></svg>;
}

export default function ListManager({
  lists,
  words,
  onCreate,
  onDelete,
  onToggleWord,
  onReplaceWords,
  onPractice,
}: {
  lists: CustomWordList[];
  words: Word[];
  onCreate: (name: string) => string | undefined;
  onDelete: (id: string) => void;
  onToggleWord: (listId: string, wordId: number) => void;
  onReplaceWords: (listId: string, wordIds: number[]) => void;
  onPractice: (list: CustomWordList) => void;
}) {
  const [selectedId, setSelectedId] = useState("hsk:1");
  const [menuOpen, setMenuOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [visibleCount, setVisibleCount] = useState(100);
  const menuRef = useRef<HTMLDialogElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const [newName, setNewName] = useState("");
  const [query, setQuery] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [paste, setPaste] = useState("");
  const [importMessage, setImportMessage] = useState("");
  const collections = useMemo(() => listCollections(words, lists), [words, lists]);
  const selected = collections.find(list => list.id === selectedId) || collections[0];
  const editable = selected.category !== "hsk";
  const isOwn = selected.category === "own";
  const wordById = useMemo(() => new Map(words.map(word => [word.id, word])), [words]);
  const selectedWords = useMemo(() => selected.wordIds.map(id => wordById.get(id)).filter((word): word is Word => !!word), [selected, wordById]);
  const filteredWords = useMemo(() => filter.trim() ? searchWords(selectedWords, filter) : selectedWords, [selectedWords, filter]);
  useEffect(() => { if (createOpen) nameRef.current?.focus(); }, [createOpen]);
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [menuOpen]);

  function closeMenu() { menuRef.current?.close(); setMenuOpen(false); }
  function selectList(id: string) {
    setSelectedId(id); setFilter(""); setQuery(""); setVisibleCount(100);
    setImportOpen(false); setPaste(""); setImportMessage(""); setCreateOpen(false); closeMenu();
  }
  function newList() { closeMenu(); setCreateOpen(true); }
  const categories: { id: ListCategory; label: string; empty: string }[] = [
    { id: "hsk", label: "HSK-niveaus", empty: "" },
    { id: "mistakes", label: "Foutieve antwoorden", empty: "Bewaar na het oefenen je fouten als lijst. Je vindt ze hier terug." },
    { id: "own", label: "Eigen lijsten", empty: "Maak een eigen lijst voor woorden die je samen wilt oefenen." },
  ];
  const results = useMemo(() => query ? searchWords(words, query).slice(0, 30) : [], [query, words]);
  const parsed = useMemo(() => resolveRows(paste, words), [paste, words]);

  function exportList() {
    if (!selected) return;
    const rows = ["Chinees;Pinyin;Vertaling", ...selected.wordIds.map((id) => wordById.get(id)).filter((word): word is Word => Boolean(word)).map((word) => `"${word.hanzi}";"${word.pinyin}";"${word.meaningNl.replace(/"/g, '""')}"`)];
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selected.name.replace(/[^a-z0-9-_]+/gi, "-") || "woordenlijst"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function importIntoSelectedList() {
    if (!isOwn || (!parsed.ids.length && !parsed.newWords.length)) return;

    const addedResult = parsed.newWords.length ? addCustomWords(parsed.newWords) : { added: 0, skipped: 0 };
    const allWords = [...words.filter((word) => !word.custom), ...loadCustomWords()];
    const resolvedAfterAdd = resolveRows(paste, allWords);
    const mergedIds = [...new Set([...selected.wordIds, ...resolvedAfterAdd.ids])];

    if (addedResult.added > 0) {
      const storedLists = loadCustomLists();
      saveCustomLists(storedLists.map((list) => list.id === selected.id ? { ...list, wordIds: mergedIds, updatedAt: Date.now() } : list));
      setImportMessage(`${resolvedAfterAdd.ids.length} ${resolvedAfterAdd.ids.length === 1 ? "woord" : "woorden"} aan de lijst toegevoegd, waarvan ${addedResult.added} nieuwe (+)-woorden.`);
      window.setTimeout(() => window.location.reload(), 500);
      return;
    }

    onReplaceWords(selected.id, mergedIds);
    setImportMessage(`${resolvedAfterAdd.ids.length} ${resolvedAfterAdd.ids.length === 1 ? "woord" : "woorden"} aan de lijst toegevoegd${addedResult.skipped ? `, ${addedResult.skipped} al aanwezig of HSK` : ""}.`);
    setPaste("");
    window.setTimeout(() => setImportOpen(false), 450);
  }

  return (
    <div className="page lists-page">
      <div className="page-title-row lists-title-row">
        <button className="icon-action list-menu-toggle" aria-label="Lijstenmenu openen" aria-haspopup="dialog" aria-expanded={menuOpen} aria-controls="lists-menu" onClick={() => { menuRef.current?.showModal(); setMenuOpen(true); }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <div><p className="eyebrow">Jouw collecties</p><h1>Lijsten</h1></div>
        <button className="icon-action" aria-label="Nieuwe eigen lijst" title="Nieuwe eigen lijst" onClick={newList}>＋</button>
      </div>

      <dialog ref={menuRef} id="lists-menu" className="lists-drawer" aria-labelledby="lists-menu-title" onClose={() => setMenuOpen(false)} onClick={event => { if (event.target === event.currentTarget) closeMenu(); }}>
        <div className="lists-drawer-panel">
          <div className="lists-drawer-heading"><div><p className="eyebrow">Collecties</p><h2 id="lists-menu-title">Kies je lijst</h2></div><button className="icon-action" aria-label="Lijstenmenu sluiten" onClick={closeMenu}>×</button></div>
          <nav aria-label="Woordenlijsten">
            {categories.map(category => {
              const items = collections.filter(list => list.category === category.id);
              return <section className="lists-menu-group" key={category.id} aria-labelledby={`list-group-${category.id}`}>
                <h3 id={`list-group-${category.id}`}>{category.label}</h3>
                {items.map(list => <button key={list.id} className={`lists-menu-item${selected.id === list.id ? " active" : ""}`} aria-current={selected.id === list.id ? "true" : undefined} onClick={() => selectList(list.id)}>
                  <span><strong>{list.name}</strong>{list.direction && <small>{directionLabels[list.direction]}</small>}</span>
                  <span className="lists-menu-count">{list.wordIds.length.toLocaleString("nl-BE")}<span className="sr-only"> {list.wordIds.length === 1 ? "woord" : "woorden"}</span></span>
                </button>)}
                {!items.length && <p className="lists-menu-empty">{category.empty}</p>}
                {category.id === "own" && <button className="lists-menu-create" onClick={newList}><span aria-hidden="true">＋</span> Nieuwe eigen lijst</button>}
              </section>;
            })}
          </nav>
        </div>
      </dialog>

      {createOpen && <section className="list-create-card" aria-label="Nieuwe eigen lijst">
        <h2>Een lijst voor jou</h2><p>Geef je lijst een naam en voeg daarna woorden toe.</p>
        <form className="list-create-row" onSubmit={event => { event.preventDefault(); if (!newName.trim()) return; const id = onCreate(newName.trim()); if (id) selectList(id); setNewName(""); }}>
          <input ref={nameRef} id="new-list-name" aria-label="Naam van je eigen lijst" value={newName} onChange={event => setNewName(event.target.value)} placeholder="Bijvoorbeeld: op reis" required />
          <button className="icon-action primary" aria-label="Lijst maken" title="Lijst maken">✓</button>
        </form>
        <button className="list-text-button" onClick={() => setCreateOpen(false)}>Annuleren</button>
      </section>}

      <section className="list-overview" aria-labelledby="selected-list-title">
        <span className={`list-category-label category-${selected.category}`}>{categories.find(category => category.id === selected.category)?.label}</span>
        <h2 id="selected-list-title">{selected.name}</h2>
        <p>{selectedWords.length.toLocaleString("nl-BE")} {selectedWords.length === 1 ? "woord" : "woorden"}{selected.direction ? ` · ${directionLabels[selected.direction]}` : ""}</p>
        <div className="list-overview-actions">
          <button className="button primary-button list-practice-button" onClick={() => onPractice(selected)} disabled={!selectedWords.length}><ActionGlyph type="play" /> Oefen deze lijst</button>
          <button className="icon-action" onClick={exportList} disabled={!selectedWords.length} aria-label="Lijst exporteren" title="Exporteren"><ActionGlyph type="export" /></button>
          {editable && <button className="icon-action danger" onClick={() => { if (window.confirm(`“${selected.name}” verwijderen?`)) onDelete(selected.id); }} aria-label="Lijst verwijderen" title="Verwijderen"><ActionGlyph type="trash" /></button>}
        </div>
      </section>

      {isOwn && <section className="list-edit-section" aria-label="Woorden toevoegen">
        <div className="list-edit-heading"><h2>Woorden toevoegen</h2><button className="icon-action" onClick={() => { setImportOpen(value => !value); setImportMessage(""); }} aria-label="Woorden importeren" aria-expanded={importOpen} title="Importeren"><ActionGlyph type="import" /></button></div>
        {importOpen && <section className="list-import-card">
          <p><strong>Importeren naar “{selected.name}”</strong></p>
          <textarea aria-label="Woorden om te importeren" value={paste} onChange={event => { setPaste(event.target.value); setImportMessage(""); }} placeholder={'中国; Zhōngguó; China\n美国; Měiguó; Amerika\n比利时; Bǐlìshí; België'} />
          <small>Bestaande woorden worden gekoppeld. Nieuwe woorden met Chinees, pinyin en vertaling worden toegevoegd aan je eigen woorden.</small>
          <div className="import-summary"><strong>{parsed.ids.length} bestaand</strong>{parsed.newWords.length > 0 && <strong>{parsed.newWords.length} nieuw</strong>}{parsed.unmatched > 0 && <span>{parsed.unmatched} niet herkend</span>}<button className="icon-action primary" disabled={!parsed.ids.length && !parsed.newWords.length} onClick={importIntoSelectedList} aria-label="Import bevestigen">✓</button></div>
          {importMessage && <p role="status">{importMessage}</p>}
        </section>}
        <label className="search-box compact-list-search"><span aria-hidden="true">＋</span><input aria-label="Zoek een woord om toe te voegen" value={query} onChange={event => setQuery(event.target.value)} placeholder="Zoek een woord om toe te voegen" /></label>
        {query && <div className="list-search-results">{results.map(word => {
          const added = selected.wordIds.includes(word.id);
          return <button key={word.id} aria-pressed={added} onClick={() => onToggleWord(selected.id, word.id)}><strong>{word.hanzi}</strong><span>{word.pinyin}</span><small>{word.meaningNl}</small><b aria-hidden="true">{added ? "✓" : "＋"}</b></button>;
        })}{!results.length && <p>Geen woorden gevonden. Je kunt nieuwe woorden importeren.</p>}</div>}
      </section>}

      {selectedWords.length > 0 ? <>
        <label className="search-box compact-list-search"><span aria-hidden="true">⌕</span><input aria-label="Zoek binnen deze lijst" value={filter} onChange={event => { setFilter(event.target.value); setVisibleCount(100); }} placeholder={`Zoek in ${selected.name}`} /></label>
        <p className="list-results-count" role="status">{filteredWords.length.toLocaleString("nl-BE")} {filteredWords.length === 1 ? "woord" : "woorden"}{filter && " gevonden"}</p>
        <div className={`list-word-rows${editable ? "" : " list-word-rows-fixed"}`}>{filteredWords.slice(0, visibleCount).map(word => <div key={word.id}><strong>{word.hanzi}</strong><span>{word.pinyin}</span><small>{word.meaningNl}</small>{editable && <button onClick={() => onToggleWord(selected.id, word.id)} aria-label={`Verwijder ${word.hanzi} uit de lijst`} title="Uit lijst verwijderen">×</button>}</div>)}</div>
        {!filteredWords.length && <p className="list-empty-message">Geen woorden gevonden. Probeer een andere zoekterm.</p>}
        {filteredWords.length > visibleCount && <button className="button list-load-more" onClick={() => setVisibleCount(count => count + 100)}>Meer woorden tonen <span>({Math.min(visibleCount, filteredWords.length)} van {filteredWords.length.toLocaleString("nl-BE")})</span></button>}
      </> : <p className="list-empty-message">Deze lijst is nog leeg.{isOwn ? " Zoek hierboven een woord of importeer je woordenlijst." : ""}</p>}
    </div>
  );
}
