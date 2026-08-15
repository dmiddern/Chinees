import { useEffect, useMemo, useState } from "react";
import { addCustomWords, type NewCustomWord } from "../lib/customWords";

function splitDelimited(line: string, delimiter: string) {
  const cells: string[] = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }
    if (character === delimiter && !quoted) {
      cells.push(value.trim());
      value = "";
    } else {
      value += character;
    }
  }
  cells.push(value.trim());
  return cells;
}

function cleanLine(line: string) {
  return line
    .trim()
    .replace(/^[-•*]\s+/, "")
    .replace(/^\d+[.)]\s+/, "");
}

function isHeader(cells: string[]) {
  const joined = cells.join(" ").toLocaleLowerCase();
  return /chinees|hanzi|karakter|pinyin|betekenis|vertaling|nederlands/.test(joined);
}

function parseWords(text: string) {
  const valid: NewCustomWord[] = [];
  const invalid: string[] = [];

  text.split(/\r?\n/).forEach((rawLine) => {
    const line = cleanLine(rawLine);
    if (!line) return;

    const delimiter = line.includes("\t")
      ? "\t"
      : line.includes(";")
        ? ";"
        : line.includes("|")
          ? "|"
          : line.includes(",")
            ? ","
            : "";

    if (!delimiter) {
      invalid.push(rawLine);
      return;
    }

    const cells = splitDelimited(line, delimiter).map((cell) => cell.trim()).filter(Boolean);
    if (isHeader(cells)) return;
    if (cells.length < 3) {
      invalid.push(rawLine);
      return;
    }

    valid.push({
      hanzi: cells[0],
      pinyin: cells[1],
      meaningNl: cells.slice(2).join(delimiter === "," ? ", " : "; "),
    });
  });

  return { valid, invalid };
}

export default function BulkWordImport() {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const updateVisibility = () => setVisible(Boolean(document.querySelector(".words-page")));
    updateVisibility();
    const observer = new MutationObserver(updateVisibility);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const parsed = useMemo(() => parseWords(text), [text]);

  if (!visible && !open) return null;

  function importWords() {
    if (!parsed.valid.length) return;
    const result = addCustomWords(parsed.valid);
    setMessage(`${result.added} woord${result.added === 1 ? "" : "en"} toegevoegd${result.skipped ? `, ${result.skipped} overgeslagen` : ""}.`);
    if (result.added) {
      window.setTimeout(() => window.location.reload(), 650);
    }
  }

  return (
    <>
      {visible && !open && (
        <button
          type="button"
          onClick={() => { setOpen(true); setMessage(""); }}
          aria-label="Voeg woorden toe door een lijst te plakken"
          title="Lijst plakken"
          style={{
            position: "fixed",
            right: 18,
            bottom: 88,
            zIndex: 30,
            border: 0,
            borderRadius: 999,
            padding: "12px 16px",
            boxShadow: "0 8px 24px rgba(0,0,0,.18)",
            background: "var(--ink, #1f2937)",
            color: "white",
            font: "inherit",
            fontWeight: 700,
          }}
        >
          ⊕ Lijst plakken
        </button>
      )}

      {open && (
        <div
          role="presentation"
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 80,
            background: "rgba(0,0,0,.38)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="bulk-word-title"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "min(720px, 100%)",
              maxHeight: "88vh",
              overflowY: "auto",
              background: "var(--paper, #fff)",
              color: "var(--ink, #1f2937)",
              borderRadius: "22px 22px 0 0",
              padding: 20,
              boxShadow: "0 -12px 40px rgba(0,0,0,.18)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start" }}>
              <div>
                <small style={{ fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em", opacity: .6 }}>⊕ Eigen woorden</small>
                <h2 id="bulk-word-title" style={{ margin: "4px 0 6px" }}>Plak een woordenlijst</h2>
                <p style={{ margin: 0, opacity: .72 }}>Eén woord per regel: Chinees, pinyin, Nederlandse betekenis.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Sluiten" style={{ border: 0, background: "transparent", fontSize: 28, lineHeight: 1 }}>×</button>
            </div>

            <textarea
              value={text}
              onChange={(event) => { setText(event.target.value); setMessage(""); }}
              autoFocus
              spellCheck={false}
              placeholder={'美国; Měiguó; Amerika\n比利时; Bǐlìshí; België\n比利时人; Bǐlìshírén; Belg'}
              style={{
                width: "100%",
                minHeight: 180,
                marginTop: 18,
                padding: 14,
                borderRadius: 14,
                border: "1px solid rgba(0,0,0,.18)",
                background: "transparent",
                color: "inherit",
                font: "inherit",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />

            <p style={{ margin: "8px 0 0", fontSize: 13, opacity: .62 }}>
              Werkt met tabbladen, puntkomma’s, verticale strepen of komma’s. Een kopregel zoals “Chinees; Pinyin; Vertaling” wordt automatisch genegeerd.
            </p>

            {parsed.valid.length > 0 && (
              <div style={{ marginTop: 18 }}>
                <strong>{parsed.valid.length} woord{parsed.valid.length === 1 ? "" : "en"} herkend</strong>
                <div style={{ marginTop: 8, border: "1px solid rgba(0,0,0,.1)", borderRadius: 12, overflow: "hidden" }}>
                  {parsed.valid.slice(0, 8).map((word, index) => (
                    <div key={`${word.hanzi}-${word.pinyin}-${index}`} style={{ display: "grid", gridTemplateColumns: "80px 1fr 1.4fr", gap: 8, padding: "9px 11px", borderTop: index ? "1px solid rgba(0,0,0,.08)" : undefined, fontSize: 14 }}>
                      <b>{word.hanzi}</b>
                      <span>{word.pinyin}</span>
                      <span>{word.meaningNl}</span>
                    </div>
                  ))}
                </div>
                {parsed.valid.length > 8 && <small style={{ display: "block", marginTop: 6, opacity: .62 }}>+ {parsed.valid.length - 8} extra</small>}
              </div>
            )}

            {parsed.invalid.length > 0 && (
              <p style={{ marginTop: 12, padding: 10, borderRadius: 10, background: "rgba(180,80,40,.08)", fontSize: 13 }}>
                {parsed.invalid.length} regel{parsed.invalid.length === 1 ? "" : "s"} niet herkend. Elke regel moet minstens 3 kolommen bevatten.
              </p>
            )}

            {message && <p style={{ marginTop: 12, fontWeight: 700 }}>{message}</p>}

            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button type="button" onClick={() => setOpen(false)} style={{ flex: 1, padding: 13, borderRadius: 12, border: "1px solid rgba(0,0,0,.15)", background: "transparent", color: "inherit", font: "inherit", fontWeight: 700 }}>Annuleren</button>
              <button type="button" disabled={!parsed.valid.length} onClick={importWords} style={{ flex: 1.5, padding: 13, borderRadius: 12, border: 0, background: "var(--ink, #1f2937)", color: "white", font: "inherit", fontWeight: 800, opacity: parsed.valid.length ? 1 : .45 }}>
                Voeg {parsed.valid.length || ""} woord{parsed.valid.length === 1 ? "" : "en"} toe
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
