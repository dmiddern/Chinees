import { useMemo, useState } from "react";
import type { CustomWordList } from "../lib/customLists";
import { loadCustomLists, saveCustomLists } from "../lib/customLists";
import { addCustomWords, loadCustomWords, type NewCustomWord } from "../lib/customWords";
import { searchWords } from "../lib/search";
import type { Word } from "../types";

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
    if (!delimiter) return [line];
    return splitDelimited(line, delimiter).filter(Boolean);
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
  onCreate: (name: string) => void;
  onDelete: (id: string) => void;
  onToggleWord: (listId: string, wordId: number) => void;
  onReplaceWords: (listId: string, wordIds: number[]) => void;
  onPractice: (list: CustomWordList) => void;
}) {
  const [selectedId, setSelectedId] = useState(lists[0]?.id || "");
  const [newName, setNewName] = useState("");
  const [query, setQuery] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [paste, setPaste] = useState("");
  const [importMessage, setImportMessage] = useState("");
  const selected = lists.find((list) => list.id === selectedId) || lists[0];
  const results = useMemo(() => query ? searchWords(words, query).slice(0, 30) : [], [query, words]);
  const parsed = useMemo(() => resolveRows(paste, words), [paste, words]);

  function exportList() {
    if (!selected) return;
    const rows = ["Chinees;Pinyin;Vertaling", ...selected.wordIds.map((id) => words.find((word) => word.id === id)).filter((word): word is Word => Boolean(word)).map((word) => `"${word.hanzi}";"${word.pinyin}";"${word.meaningNl.replace(/"/g, '""')}"`)];
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selected.name.replace(/[^a-z0-9-_]+/gi, "-") || "woordenlijst"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function importIntoSelectedList() {
    if (!selected || (!parsed.ids.length && !parsed.newWords.length)) return;

    const addedResult = parsed.newWords.length ? addCustomWords(parsed.newWords) : { added: 0, skipped: 0 };
    const allWords = [...words.filter((word) => !word.custom), ...loadCustomWords()];
    const resolvedAfterAdd = resolveRows(paste, allWords);
    const mergedIds = [...new Set([...selected.wordIds, ...resolvedAfterAdd.ids])];

    if (addedResult.added > 0) {
      const storedLists = loadCustomLists();
      saveCustomLists(storedLists.map((list) => list.id === selected.id ? { ...list, wordIds: mergedIds, updatedAt: Date.now() } : list));
      setImportMessage(`${resolvedAfterAdd.ids.length} woorden aan de lijst toegevoegd, waarvan ${addedResult.added} nieuwe (+)-woorden.`);
      window.setTimeout(() => window.location.reload(), 500);
      return;
    }

    onReplaceWords(selected.id, mergedIds);
    setImportMessage(`${resolvedAfterAdd.ids.length} woorden aan de lijst toegevoegd${addedResult.skipped ? `, ${addedResult.skipped} al aanwezig of HSK` : ""}.`);
    setPaste("");
    window.setTimeout(() => setImportOpen(false), 450);
  }

  return (
    <div className="page lists-page">
      <div className="page-title-row">
        <div><p className="eyebrow">Collecties</p><h1>Lijsten</h1></div>
        <button className="icon-action primary" aria-label="Nieuwe lijst" title="Nieuwe lijst" onClick={() => document.getElementById("new-list-name")?.focus()}>＋</button>
      </div>

      <form className="list-create-row" onSubmit={(event) => { event.preventDefault(); if (!newName.trim()) return; onCreate(newName.trim()); setNewName(""); }}>
        <input id="new-list-name" value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Naam" />
        <button className="icon-action" aria-label="Lijst maken" title="Lijst maken">✓</button>
      </form>

      <div className="list-selector">
        {lists.map((list) => <button key={list.id} className={selected?.id === list.id ? "active" : ""} onClick={() => setSelectedId(list.id)}><strong>{list.name}</strong><span>{list.wordIds.length}</span></button>)}
      </div>

      {selected ? (
        <>
          <div className="list-toolbar">
            <button className="icon-action" onClick={() => onPractice(selected)} disabled={!selected.wordIds.length} aria-label="Oefenen" title="Oefenen"><ActionGlyph type="play" /></button>
            <button className="icon-action" onClick={() => { setImportOpen((value) => !value); setImportMessage(""); }} aria-label="Mass import" title="Mass import"><ActionGlyph type="import" /></button>
            <button className="icon-action" onClick={exportList} disabled={!selected.wordIds.length} aria-label="Exporteren" title="Exporteren"><ActionGlyph type="export" /></button>
            <button className="icon-action danger" onClick={() => { if (window.confirm(`“${selected.name}” verwijderen?`)) onDelete(selected.id); }} aria-label="Verwijderen" title="Verwijderen"><ActionGlyph type="trash" /></button>
          </div>

          {importOpen && (
            <section className="list-import-card">
              <p><strong>Mass import naar “{selected.name}”</strong></p>
              <textarea value={paste} onChange={(event) => { setPaste(event.target.value); setImportMessage(""); }} placeholder={'中国; Zhōngguó; China\n美国; Měiguó; Amerika\n比利时; Bǐlìshí; België'} />
              <small>Bestaande HSK-woorden worden aan de lijst gekoppeld. Nieuwe woorden worden als (+)-woord aangemaakt en meteen aan deze lijst toegevoegd.</small>
              <div className="import-summary">
                <strong>{parsed.ids.length} bestaand ✓</strong>
                {parsed.newWords.length > 0 && <strong>{parsed.newWords.length} nieuw ＋</strong>}
                {parsed.unmatched > 0 && <span>{parsed.unmatched} ?</span>}
                <button className="icon-action primary" disabled={!parsed.ids.length && !parsed.newWords.length} onClick={importIntoSelectedList} aria-label="Importeren" title="Importeren">✓</button>
              </div>
              {importMessage && <p><strong>{importMessage}</strong></p>}
            </section>
          )}

          <label className="search-box compact-list-search"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Woord toevoegen" /></label>
          {query && <div className="list-search-results">{results.map((word) => { const added = selected.wordIds.includes(word.id); return <button key={word.id} onClick={() => onToggleWord(selected.id, word.id)}><strong>{word.hanzi}</strong><span>{word.pinyin}</span><small>{word.meaningNl}</small><b>{added ? "✓" : "＋"}</b></button>; })}</div>}

          <div className="list-word-rows">{selected.wordIds.map((id) => words.find((word) => word.id === id)).filter((word): word is Word => Boolean(word)).map((word) => <div key={word.id}><strong>{word.hanzi}</strong><span>{word.pinyin}</span><small>{word.meaningNl}</small><button onClick={() => onToggleWord(selected.id, word.id)} aria-label={`Verwijder ${word.hanzi}`} title="Verwijderen">×</button></div>)}</div>
        </>
      ) : <div className="guide-empty"><strong>＋</strong></div>}
    </div>
  );
}
