export type ExamOption = string | { id?: string; text?: string; label?: string };

export type McqQuestion = {
  id: string;
  chapter?: number;
  prompt: string;
  options: ExamOption[];
  timer?: number | null;
};

export type EssayQuestion = {
  id: string;
  title: string;
  question: string;
  description?: string | null;
};

export type ClassExam = {
  id: string;
  courseId: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ClassExamListItem = ClassExam & {
  hasAttempted: boolean;
  lastAttemptAt: string | null;
  lastScore: {
    correctCount: number;
    totalQuestions: number;
    percentage: number;
  } | null;
};

export type ClassExamTakeData = {
  exam: ClassExam;
  chapters: {
    "1"?: McqQuestion[];
    "2"?: McqQuestion[];
  };
  essayQuestion: EssayQuestion | null;
};

export type ReviewStatus = "correct" | "wrong" | "unanswered";

export type SubmitResultItem = {
  questionId: string;
  prompt?: string;
  explanation?: string;
  correctOptionText?: string;
  selectedOptionText?: string;
  correctOptionIndex?: number | null;
  selectedOptionIndex?: number | null;
};

export type AttemptShape = {
  score?: {
    correctCount?: number;
    totalQuestions?: number;
    percentage?: number;
  };
  essayAnswer?: {
    questionId: string;
    prompt?: string;
    answerText: string;
  } | null;
};

export type ClassExamSubmitResponse = {
  data: {
    exam?: ClassExam;
    attempt?: AttemptShape | null;
    previousAttempt?: AttemptShape | null;
    breakdown?: {
      correctCount: number;
      wrongCount: number;
      unansweredCount: number;
      totalQuestions: number;
      percentage: number;
    };
    correct?: SubmitResultItem[];
    wrong?: SubmitResultItem[];
    unanswered?: SubmitResultItem[];
  };
};

export type QuestionReview = {
  status: ReviewStatus;
  explanation?: string;
  correctOptionText?: string;
  selectedOptionText?: string;
  correctOptionIndex?: number | null;
  selectedOptionIndex?: number | null;
};

export type ExamPhase = "chapter1" | "chapter2" | "essay" | "review";

export type ReviewChapter = 1 | 2 | 3;

export const getOptionText = (option: ExamOption) => {
  if (typeof option === "string") return option;
  return option.text || option.label || "";
};

export const CLASS_EXAM_CHAPTER_DURATION_SECONDS = 20 * 60;

/** @deprecated use CLASS_EXAM_CHAPTER_DURATION_SECONDS */
export const CLASS_EXAM_DURATION_SECONDS = CLASS_EXAM_CHAPTER_DURATION_SECONDS;

export const formatExamTimer = (totalSeconds: number) => {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const getQuestionTimerSeconds = (timer: number | null | undefined) => {
  const value = Number(timer);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : null;
};

export const getPlainTextLength = (value?: string | null) =>
  (value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim().length;

export const getAttemptPercentage = (attempt: AttemptShape | null | undefined) => {
  if (!attempt) return 0;
  return attempt.score?.percentage ?? 0;
};

const normalizeHtmlText = (value?: string | null) =>
  (value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const findOptionIndexByText = (options: ExamOption[], text?: string | null) => {
  const normalized = normalizeHtmlText(text);
  if (!normalized) return null;
  const index = options.findIndex((option) => normalizeHtmlText(getOptionText(option)) === normalized);
  return index >= 0 ? index : null;
};

export const resolveOptionIndex = (
  options: ExamOption[],
  explicitIndex: number | null | undefined,
  optionText?: string | null
) => {
  if (typeof explicitIndex === "number" && explicitIndex >= 0 && explicitIndex < options.length) {
    return explicitIndex;
  }
  return findOptionIndexByText(options, optionText);
};

export const buildReviewByQuestionId = (result: ClassExamSubmitResponse["data"] | null) => {
  const map = new Map<string, QuestionReview>();
  if (!result) return map;

  const pushItems = (items: SubmitResultItem[] | undefined, status: ReviewStatus) => {
    (items || []).forEach((item) => {
      if (!item?.questionId) return;
      map.set(item.questionId, {
        status,
        explanation: item.explanation,
        correctOptionText: item.correctOptionText,
        selectedOptionText: item.selectedOptionText,
        correctOptionIndex: item.correctOptionIndex,
        selectedOptionIndex: item.selectedOptionIndex,
      });
    });
  };

  pushItems(result.correct, "correct");
  pushItems(result.wrong, "wrong");
  pushItems(result.unanswered, "unanswered");

  return map;
};

export const formatAttemptDate = (value: string | null | undefined, lang: "ar" | "he") => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat(lang === "ar" ? "ar-EG" : "he-IL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export const getChapterQuestions = (
  chapters: ClassExamTakeData["chapters"],
  chapter: 1 | 2
): McqQuestion[] => {
  const key = String(chapter) as "1" | "2";
  return chapters[key] ?? [];
};

export const optionToneClasses = [
  "bg-sky-500/8 hover:bg-sky-500/12",
  "bg-emerald-500/8 hover:bg-emerald-500/12",
  "bg-amber-500/8 hover:bg-amber-500/12",
  "bg-rose-500/8 hover:bg-rose-500/12",
];

export const PROMPT_HTML_CLASS =
  "text-foreground leading-4 [&_p]:text-start [&_p]:mb-1 [&_p:empty]:min-h-[1em] [&_p:has(>br:only-child)]:min-h-[1em]";

export const OPTION_HTML_CLASS = "min-w-0 flex-1 text-start leading-4 [&_p]:mb-0.5";

export const LONG_QUESTION_CHAR_THRESHOLD = 140;
export const DESKTOP_WRAP_FALLBACK_PX = 1040;
export const DESKTOP_WRAP_STORAGE_KEY = "najah-exam-desktop-wrap-width";
export const MD_QUERY = "(min-width: 768px)";

export const readStoredDesktopWrapWidth = () => {
  if (typeof window === "undefined") return DESKTOP_WRAP_FALLBACK_PX;
  const stored = Number(window.sessionStorage.getItem(DESKTOP_WRAP_STORAGE_KEY));
  return Number.isFinite(stored) && stored > 200 ? stored : DESKTOP_WRAP_FALLBACK_PX;
};
