export interface HanziPracticeSettings {
  leniency: number;
  showHintAfterMisses: number | false;
  markStrokeCorrectAfterMisses: number | false;
  quizStartStrokeNum: number;
  acceptBackwardsStrokes: boolean;
  highlightOnComplete: boolean;
  showOutline: boolean;
  showCharacter: boolean;
  strokeAnimationSpeed: number;
  strokeHighlightSpeed: number;
  strokeFadeDuration: number;
  delayBetweenStrokes: number;
  delayBetweenLoops: number;
  drawingWidth: number;
}

const STORAGE_KEY = "chinees.hanzi-practice.v1";

export const defaultHanziPracticeSettings: HanziPracticeSettings = {
  leniency: 1,
  showHintAfterMisses: 3,
  markStrokeCorrectAfterMisses: false,
  quizStartStrokeNum: 0,
  acceptBackwardsStrokes: false,
  highlightOnComplete: true,
  showOutline: true,
  showCharacter: true,
  strokeAnimationSpeed: 1,
  strokeHighlightSpeed: 2,
  strokeFadeDuration: 400,
  delayBetweenStrokes: 220,
  delayBetweenLoops: 2000,
  drawingWidth: 4,
};

export function loadHanziPracticeSettings(): HanziPracticeSettings {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as Partial<HanziPracticeSettings>;
    return { ...defaultHanziPracticeSettings, ...stored };
  } catch {
    return { ...defaultHanziPracticeSettings };
  }
}

export function saveHanziPracticeSettings(settings: HanziPracticeSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function updateHanziPracticeSetting<K extends keyof HanziPracticeSettings>(key: K, value: HanziPracticeSettings[K]) {
  const next = { ...loadHanziPracticeSettings(), [key]: value };
  saveHanziPracticeSettings(next);
  return next;
}
