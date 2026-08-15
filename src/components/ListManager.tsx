import { useMemo, useState } from "react";
import type { CustomWordList } from "../lib/customLists";
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

function idsFromText(text: string, words: Word[]) {
  const byHanzi = new Map(words.map((word) => [word.hanzi, word.id]));
  const byPinyin = new Map(words.map((word) => [normalize(word.pinyin), word.id]));
  const found = new Set<number>();
  let unmatched = 0;
  for (const cells of parseRows(text)) {
    const hanzi = cells.find((cell) => /[\u3400-\u9fff]/u.test(cell));
    const id = (hanzi && byHanzi.get(hanzi)) ?? cells.map((cell) => byPinyin.get(normalize(cell))).find(Boolean);
    if (id) found.add(id); else unmatched += 1;
  }
  return { ids: [...found], unmatched };
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
  const selected = lists.find((list) => list.id === selectedId) || lists[0];
  const results = useMemo(() => query ? searchWords(words, query).slice(0, 30) : [], [query, words]);
  const parsed = useMemo(() => idsFromText(paste, words), [paste, words]);

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
            <button className="icon-action" onClick={() => onPractice(selected)} disabled={!selected.wordIds.length} aria-label="Oefenen" title="Oefenen">▶︎</button>
            <button className="icon-action" onClick={() => setImportOpen((value) => !value)} aria-label="Lijst plakken" title="Lijst plakken">▣</button>
            <button className="icon-action" onClick={exportList} disabled={!selected.wordIds.length} aria-label="Exporteren" title="Exporteren">⇧</button>
            <button className="icon-action danger" onClick={() => { if (window.confirm(`“${selected.name}” verwijderen?`)) onDelete(selected.id); }} aria-label="Verwijderen" title="Verwijderen">⌫</button>
          </div>

          {importOpen && (
            <section className="list-import-card">
              <textarea value={paste} onChange={(event) => setPaste(event.target.value)} placeholder={'中国; Zhōngguó; China\n美国; Měiguó; Amerika'} />
              <div className="import-summary"><strong>{parsed.ids.length} ✓</strong>{parsed.unmatched > 0 && <span>{parsed.unmatched} ?</span>}<button className="icon-action primary" disabled={!parsed.ids.length} onClick={() => { onReplaceWords(selected.id, parsed.ids); setPaste(""); setImportOpen(false); }} aria-label="Importeren" title="Importeren">✓</button></div>
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
