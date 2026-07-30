export type HskLevel = 1 | 2 | 3;
export type Skill = "meaning" | "pronunciation" | "writing";
export type LearningStatus = "new" | "learning" | "known";
export type Direction = "zh-nl" | "nl-zh";

export interface Word {
  id: number;
  level: HskLevel;
  hanzi: string;
  pinyin: string;
  wordType: string;
  meaningNl: string;
  meaningLanguage: "nl";
  example: string;
  notes: string;
  source: string;
}

export interface SkillProgress {
  status: LearningStatus;
  correct: number;
  incorrect: number;
  streak: number;
  dueAt: number;
  lastReviewedAt?: number;
}

export interface WordProgress {
  meaning: SkillProgress;
  pronunciation: SkillProgress;
  writing: SkillProgress;
  notes: string;
  favorite: boolean;
}

export type ProgressMap = Record<number, WordProgress>;

