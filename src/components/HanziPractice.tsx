import { useEffect, useMemo, useRef, useState } from "react";
import HanziWriter from "hanzi-writer";
import radicalsData from "../data/radicals.json";
import { radicalMeanings } from "../data/radicalMeanings";
import { literalGlosses } from "../data/literalGlosses";

interface Props {
  hanzi: string;
  onComplete?: (mistakes: number) => void;
}

const chineseCharacters = (value: string) => [...value].filter((character) => /[\u3400-\u9fff]/.test(character));
const radicals = radicalsData as Record<string, { radical: string; meaning: string }>;

function radicalDescription(character: string) {
  const info = radicals[character];
  if (!info) return "Radicaalgegevens niet beschikbaar.";
  const meaning = radicalMeanings[info.radical] || literalGlosses[info.radical] || info.meaning.split(";")[0];
  return `Radicaal: ${info.radical} · ${meaning}`;
}

const writerOptions = (size: number) => ({
  width: size,
  height: size,
  padding: Math.round(size * 0.06),
  strokeColor: "#373534",
  radicalColor: "#A66A57",
  outlineColor: "#DDD8D2",
  drawingColor: "#A66A57",
  showOutline: true,
  strokeAnimationSpeed: 1,
  delayBetweenStrokes: 220,
  charDataLoader: async (char: string) => {
    const response = await fetch(`/hanzi-data/${encodeURIComponent(char)}.json`);
    if (!response.ok) throw new Error(`Geen schrijfdata voor ${char}`);
    return response.json();
  },
});

export function StrokeOrderPreview({ hanzi }: { hanzi: string }) {
  const characters = useMemo(() => chineseCharacters(hanzi), [hanzi]);
  const targets = useRef<(HTMLDivElement | null)[]>([]);
  const writers = useRef<HanziWriter[]>([]);

  function play() {
    writers.current.forEach((writer) => {
      writer.hideCharacter();
      writer.animateCharacter();
    });
  }

  useEffect(() => {
    writers.current = characters.flatMap((character, index) => {
      const target = targets.current[index];
      if (!target) return [];
      target.innerHTML = "";
      return [HanziWriter.create(target, character, {
        ...writerOptions(132),
        showCharacter: false,
      })];
    });
    const frame = window.requestAnimationFrame(play);
    return () => window.cancelAnimationFrame(frame);
  }, [characters]);

  return (
    <div className="stroke-preview">
      <div className="stroke-preview-characters">
        {characters.map((character, index) => (
          <div
            className="stroke-preview-grid"
            key={`${character}-${index}`}
            ref={(element) => { targets.current[index] = element; }}
            aria-label={`Streekvolgorde van ${character}`}
          />
        ))}
      </div>
      <button className="text-button stroke-replay" onClick={play}>↻ Opnieuw afspelen</button>
    </div>
  );
}

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
      ...writerOptions(280),
      showOutline: true,
      showCharacter: true,
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
      <p className="radical-legend"><span /> {radicalDescription(character)}</p>

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
