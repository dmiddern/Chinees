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
    if (session?.direction !== "nl-zh" || session?.revealed || !exercise) return null;
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
    .stroke-quiz-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(138px,1fr));gap:12px}
    .stroke-quiz-box{display:grid;gap:7px}
    .stroke-quiz-target{width:100%;aspect-ratio:1;border:1.5px solid #cfc8c0;border-radius:15px;background:#fff;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none}
    .stroke-quiz-status{text-align:center;color:#6d6863;min-height:1.35em;font-size:.88rem}
    .stroke-quiz-status.is-error{color:#a54438;font-weight:700}
    .stroke-quiz-status.is-complete{color:#39705d;font-weight:700}
  `;
  document.head.append(style);
}

function installQuiz(target: HTMLElement, character: string, status: HTMLElement) {
  requestAnimationFrame(() => {
    const size = Math.max(120, Math.floor(target.getBoundingClientRect().width || 160));
    const missesPerStroke = new Map<number, number>();

    const writer = HanziWriter.create(target, character, {
      width: size,
      height: size,
      padding: 10,
      showCharacter: false,
      showOutline: false,
      strokeColor: "#373534",
      radicalColor: "#a66a57",
      drawingColor: "#373534",
      drawingWidth: 5,
      highlightColor: "#c87563",
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
          ? "3/3 — de juiste streek wordt getoond"
          : `Niet juist — poging ${count}/3`;
      },
      onCorrectStroke: (data) => {
        missesPerStroke.delete(data.strokeNum);
        status.className = "stroke-quiz-status";
        status.textContent = `Juist — streek ${data.strokeNum + 1} staat vast`;
      },
      onComplete: (summary) => {
        status.className = "stroke-quiz-status is-complete";
        status.textContent = summary.totalMistakes === 0
          ? "Perfect — volledig zonder fouten"
          : `Klaar — ${summary.totalMistakes} fout${summary.totalMistakes === 1 ? "" : "en"}`;
      },
    });
  });
}

function enhancePractice() {
  const wrapper = document.querySelector(".blank-practice") as HTMLElement | null;
  if (!wrapper || wrapper.dataset.strokeQuiz === "true") return;

  const word = currentWord();
  if (!word) return;

  wrapper.dataset.strokeQuiz = "true";
  wrapper.replaceChildren();

  const intro = document.createElement("p");
  intro.textContent = "Teken de volgende streek. Na drie foute pogingen wordt alleen die streek voorgedaan.";

  const row = document.createElement("div");
  row.className = "stroke-quiz-row";

  [...word.hanzi].filter((char) => HANZI.test(char)).forEach((character, index) => {
    const box = document.createElement("div");
    box.className = "stroke-quiz-box";

    const target = document.createElement("div");
    target.className = "stroke-quiz-target";
    target.setAttribute("aria-label", `Schrijfoefening karakter ${index + 1}`);

    const status = document.createElement("div");
    status.className = "stroke-quiz-status";
    status.textContent = `Karakter ${index + 1} — begin met streek 1`;

    box.append(target, status);
    row.append(box);
    installQuiz(target, character, status);
  });

  wrapper.append(intro, row);
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
    });
  };

  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  schedule();
}
