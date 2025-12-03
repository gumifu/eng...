export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type ErrorType =
  | "article"
  | "preposition"
  | "tense"
  | "word_order"
  | "vocabulary"
  | "spelling"
  | "other";

export type Mood = "🙂" | "😐" | "😭";

export interface CorrectionExplanation {
  original: string;
  corrected: string;
  reason_en: string;
  reason_ja: string;
  type: ErrorType;
}

export interface CorrectionResponse {
  corrected_text: string;
  explanations: CorrectionExplanation[];
  cefr_level: CEFRLevel;
  error_summary: Record<ErrorType, number>;
  comment?: string;
}

export interface UpgradeResponse {
  upgraded_text: string;
}

export interface StudyRecommendation {
  focus_point_ja: string;
  explanation_en: string;
  examples: string[];
  practice_questions: {
    question: string;
    options: string[];
    correct_answer: number;
  }[];
}

export interface Entry {
  id: string;
  userId: string;
  date: Date;
  title?: string;
  originalText: string;
  correctedText?: string;
  upgradedText?: string;
  cefrLevel?: CEFRLevel;
  mood?: Mood;
  createdAt: Date;
  updatedAt: Date;
}

export interface EntryAnalysis {
  id: string;
  entryId: string;
  errorType: ErrorType;
  count: number;
  comment?: string;
  createdAt: Date;
}

