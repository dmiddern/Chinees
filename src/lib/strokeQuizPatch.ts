import HanziWriter from "hanzi-writer";
import { wordsData } from "../data/words";
import type { Word } from "../types";

const HANZI = /[\u3400-\u9fff]/;
const words = wordsData as Word[];

declare global {
  interface Window {
    __strokeQuizPatchInstalled?: boolean;
  }
}

function currentWord(): Word | null {
  try {
    const session = JSON.parse(localStorage.getItem("chinees.learning-session.v1") || "null");
    const exercise = session?.queue?.[session.index];
    if (session?.direction !== "nl-zh" || !exercise) return null;
    return words.find((word) => word.id === exercise.wordId) || null;
  } catch {
    return null;
  }
}

function addStyles() {
  if (document.getElementById("stroke-quiz-patch-css")) return;
  const style = document.createElement("style");
  style.id = "stroke-quiz-patch-css";
  style.textContent = `
    .stroke-quiz-practice{margin:18px 0 14px;padding:14px;border:1px solid #ddd8d2;border-radius:18px;background:#fffdfa}
    .stroke-quiz-practice>p{margin:0 0 12px;text-align:center;color:#6d6863;line-height:1.4}
    .stroke-quiz-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(138px,1fr));gap:12px}
    .stroke-quiz-box{display:grid;gap:7px}
    .stroke-quiz-target{width:100%;aspect-ratio:1;border:1.5px solid #cfc8c0;border-radius:15px;background:#fff;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none}
    .stroke-quiz-target svg{touch-action:none}
    .stroke-quiz-status{text-align:center;color:#6d6863;min-height:1.35em;font-size:.88rem}
    .stroke-quiz-status.is-error{color:#a54438;font-weight:700}
    .stroke-quiz-status.is-complete{color:#39705d;font-weight:700}
  `;
  document.head.append(style);
}

function applyAutomaticWritingRating() {
  const card = document.querySelector(".flashcard") as HTMLElement | null;
  const result = card?.dataset.writingCorrect;
  if (!card || result === undefined) return;

  const ratingRows = [...document.querySelectorAll(".self-check .skill-rating")];
  const writingRow = ratingRows.find((row) => row.querySelector("span")?.textContent?.trim() === "Schrijfwijze");
  if (!writingRow) return;

  const buttons = writingRow.querySelectorAll("button");
  const target = result === "true" ? buttons[1] : buttons[0];
  if (target && !target.classList.contains("selected")) {
    (target as HTMLButtonElement).click();
  }
}

function installQuiz(
  target: HTMLElement,
  character: string,
  status: HTMLElement,
  onComplete: (mistakes: number) => void,
) {
  const start = () => {
    if (!target.isConnected || target.dataset.ready === "true") return;
    const measured = Math.floor(target.getBoundingClientRect().width);
    if (measured < 40) {
      requestAnimationFrame(start);
      return;
    }

    target.dataset.ready = "true";
    const size = Math.max(138, measured);
    const missesPerStroke = new Map<number, number>();

    const writer = HanziWriter.create(target, character, {
      width: size,
      height: size,
      padding: 12,
      showCharacter: false,
      showOutline: false,
      strokeColor: "#373534",
      radicalColor: "#a66a57",
      drawingColor: "#373534",
      drawingWidth: 6,
      highlightColor: "#b06b55",
      highlightCompleteColor: "#39705d",
      charDataLoader: async (char) => {
        const response = await fetch(`/hanzi-data/${encodeURIComponent(char)}.json`);
        if (!response.ok) throw new Error(`Geen schrijfdata voor ${char}`);
        return response.json();
      },
    });

    writer.quiz({
      showHintAfterMisses: 3,
      highlightOnComplete: false,
      onMistake: (data) => {
        const count = (missesPerStroke.get(data.strokeNum) || 0) + 1;
        missesPerStroke.set(data.strokeNum, count);
        status.className = "stroke-quiz-status is-error";
        status.textContent = count >= 3
          ? "3/3 — bekijk de juiste streek en probeer opnieuw"
          : `Niet juist — poging ${count}/3`;
      },
      onCorrectStroke: (data) => {
        missesPerStroke.delete(data.strokeNum);
        status.className = "stroke-quiz-status";
        status.textContent = `Juist — streek ${data.strokeNum + 1} blijft staan`;
      },
      onComplete: (summary) => {
        status.className = "stroke-quiz-status is-complete";
        status.textContent = summary.totalMistakes === 0
          ? "Perfect — volledig zonder fouten"
          : `Klaar — ${summary.totalMistakes} fout${summary.totalMistakes === 1 ? "" : "en"}`;
        onComplete(summary.totalMistakes);
      },
    });
  };

  requestAnimationFrame(start);
}

function enhancePractice() {
  const card = document.querySelector(".flashcard") as HTMLElement | null;
  const word = currentWord();
  const existing = document.querySelector(".stroke-quiz-practice") as HTMLElement | null;

  // De oude vrije tekenvlakken mogen nooit naast de interactieve oefening blijven staan.
  document.querySelectorAll(".blank-practice").forEach((element) => element.remove());

  if (!card || !word) {
    existing?.remove();
    return;
  }

  const wordKey = String(word.id);
  if (existing?.dataset.wordId === wordKey && card.contains(existing)) {
    applyAutomaticWritingRating();
    return;
  }

  existing?.remove();
  delete card.dataset.writingCorrect;
  delete card.dataset.writingMistakes;

  const wrapper = document.createElement("section");
  wrapper.className = "stroke-quiz-practice";
  wrapper.dataset.wordId = wordKey;
  wrapper.setAttribute("aria-label", "Interactieve schrijfoefening");

  const intro = document.createElement("p");
  intro.textContent = "Teken elke streek uit je hoofd. Een juiste streek blijft staan; na drie fouten krijg je een hint.";

  const row = document.createElement("div");
  row.className = "stroke-quiz-row";

  const characters = [...word.hanzi].filter((character) => HANZI.test(character));
  const results = new Map<number, number>();

  characters.forEach((character, index) => {
    const box = document.createElement("div");
    box.className = "stroke-quiz-box";

    const target = document.createElement("div");
    target.className = "stroke-quiz-target";
    target.setAttribute("aria-label", `Schrijfoefening karakter ${index + 1}`);

    const status = document.createElement("div");
    status.className = "stroke-quiz-status";
    status.textContent = `Karakter ${index + 1} — teken streek 1`;

    box.append(target, status);
    row.append(box);
    installQuiz(target, character, status, (mistakes) => {
      results.set(index, mistakes);
      if (results.size !== characters.length) return;

      const totalMistakes = [...results.values()].reduce((total, value) => total + value, 0);
      card.dataset.writingMistakes = String(totalMistakes);
      card.dataset.writingCorrect = String(totalMistakes === 0);
      applyAutomaticWritingRating();
    });
  });

  wrapper.append(intro, row);

  const reveal = card.querySelector(".reveal-button");
  const answer = card.querySelector(".answer-block");
  if (reveal) reveal.before(wrapper);
  else if (answer) answer.before(wrapper);
  else card.append(wrapper);
}

export function installStrokeQuizPatch() {
  if (window.__strokeQuizPatchInstalled) return;
  window.__strokeQuizPatchInstalled = true;
  addStyles();

  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      enhancePractice();
      applyAutomaticWritingRating();
    });
  };

  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  window.addEventListener("storage", schedule);
  schedule();
}
