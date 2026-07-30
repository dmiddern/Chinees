import { useEffect, useMemo, useRef, useState } from "react";
import HanziWriter from "hanzi-writer";

interface Props {
  hanzi: string;
  onComplete?: (mistakes: number) => void;
}

const chineseCharacters = (value: string) => [...value].filter((character) => /[\u3400-\u9fff]/.test(character));

export default function HanziPractice({ hanzi, onComplete }: Props) {
  const characters = useMemo(() => chineseCharacters(hanzi), [hanzi]);
  const [characterIndex, setCharacterIndex] = useState(0);
  const [mode, setMode] = useState<"ready" | "animating" | "quiz" | "complete">("ready");
  const [mistakes, setMistakes] = useState(0);
  const targetRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HanziWriter | null>(null);

  const character = characters[characterIndex] || hanzi[0] || "学";

  useEffect(() => {
    setCharacterIndex(0);
  }, [hanzi]);

  useEffect(() => {
    if (!targetRef.current) return;
    targetRef.current.innerHTML = "";
    setMode("ready");
    setMistakes(0);

    writerRef.current = HanziWriter.create(targetRef.current, character, {
      width: 280,
      height: 280,
      padding: 16,
      strokeColor: "#2F3135",
      radicalColor: "#8C7B6A",
      outlineColor: "#D8D4CF",
      drawingColor: "#8C7B6A",
      showOutline: true,
      showCharacter: true,
      strokeAnimationSpeed: 1,
      delayBetweenStrokes: 220,
      charDataLoader: async (char: string) => {
        const response = await fetch(`/hanzi-data/${encodeURIComponent(char)}.json`);
        if (!response.ok) throw new Error(`Geen schrijfdata voor ${char}`);
        return response.json();
      },
    });
  }, [character]);

  function animate() {
    if (!writerRef.current) return;
    setMode("animating");
    writerRef.current.animateCharacter({
      onComplete: () => setMode("ready"),
    });
  }

  function startQuiz() {
    if (!writerRef.current) return;
    let currentMistakes = 0;
    setMistakes(0);
    setMode("quiz");
    writerRef.current.quiz({
      showHintAfterMisses: 2,
      highlightOnComplete: true,
      onMistake: () => {
        currentMistakes += 1;
        setMistakes(currentMistakes);
      },
      onComplete: () => {
        setMode("complete");
        onComplete?.(currentMistakes);
      },
    });
  }

  return (
    <section className="writing-practice" aria-label={`Schrijfoefening voor ${character}`}>
      {characters.length > 1 && (
        <div className="character-tabs" aria-label="Kies een karakter">
          {characters.map((item, index) => (
            <button
              className={index === characterIndex ? "active" : ""}
              key={`${item}-${index}`}
              onClick={() => setCharacterIndex(index)}
            >
              {item}
            </button>
          ))}
        </div>
      )}

      <div className="writer-grid" ref={targetRef} />

      <div className="writer-status" aria-live="polite">
        {mode === "ready" && "Bekijk de volgorde of probeer het zelf."}
        {mode === "animating" && "De streekvolgorde wordt afgespeeld…"}
        {mode === "quiz" && `Teken met je vinger. ${mistakes ? `${mistakes} fout${mistakes === 1 ? "" : "en"}.` : ""}`}
        {mode === "complete" && (mistakes === 0 ? "Perfect geschreven." : `Klaar met ${mistakes} fout${mistakes === 1 ? "" : "en"}.`)}
      </div>

      <div className="writer-actions">
        <button className="button secondary-button" onClick={animate}>
          <span aria-hidden="true">▶</span> Stroke order
        </button>
        <button className="button primary-button" onClick={startQuiz}>
          {mode === "complete" ? "Opnieuw schrijven" : "Zelf schrijven"}
        </button>
      </div>
    </section>
  );
}
