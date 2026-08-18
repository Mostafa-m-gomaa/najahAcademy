import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, ChevronDown } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import RichHtmlContent from "@/components/RichHtmlContent";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

/** Prompts with 140+ plain-text characters lock desktop width on mobile (horizontal scroll) */
const LONG_QUESTION_CHAR_THRESHOLD = 140;
/** Typical course container content width when never measured on desktop */
const DESKTOP_WRAP_FALLBACK_PX = 1040;
const DESKTOP_WRAP_STORAGE_KEY = "najah-exam-desktop-wrap-width";
const MD_QUERY = "(min-width: 768px)";
const PROMPT_HTML_CLASS =
  "text-foreground leading-4 [&_p]:text-start [&_p]:mb-1 [&_p:empty]:min-h-[1em] [&_p:has(>br:only-child)]:min-h-[1em]";
const OPTION_HTML_CLASS = "min-w-0 flex-1 text-start leading-4 [&_p]:mb-0.5";

const readStoredDesktopWrapWidth = () => {
  if (typeof window === "undefined") return DESKTOP_WRAP_FALLBACK_PX;
  const stored = Number(window.sessionStorage.getItem(DESKTOP_WRAP_STORAGE_KEY));
  return Number.isFinite(stored) && stored > 200 ? stored : DESKTOP_WRAP_FALLBACK_PX;
};

type ExamOption = string | { text?: string; label?: string };

type ExamQuestion = {
  id: string;
  prompt: string;
  options: ExamOption[];
  timer?: number | null;
};

type ReviewStatus = "correct" | "wrong" | "unanswered";

type SubmitResultItem = {
  questionId: string;
  prompt?: string;
  explanation?: string;
  correctOptionText?: string;
  selectedOptionText?: string;
  correctOptionIndex?: number | null;
  selectedOptionIndex?: number | null;
  questionSnapshot?: {
    prompt?: string;
  };
};

type AttemptShape = {
  score?: {
    correctCount?: number;
    totalQuestions?: number;
    percentage?: number;
  };
  summary?: {
    correctCount?: number;
    totalQuestions?: number;
    percentage?: number;
  };
};

type ExamTakeResponse = {
  data: {
    exam: {
      name: string;
      description?: string;
    };
    questions: ExamQuestion[];
  };
};

type ExamSubmitResponse = {
  data: {
    correct?: SubmitResultItem[];
    wrong?: SubmitResultItem[];
    unanswered?: SubmitResultItem[];
    attempt?: AttemptShape | null;
    previousAttempt?: AttemptShape | null;
  };
};

type QuestionReview = {
  status: ReviewStatus;
  explanation?: string;
  correctOptionText?: string;
  selectedOptionText?: string;
  correctOptionIndex?: number | null;
  selectedOptionIndex?: number | null;
};

const getQuestionTimerSeconds = (timer: number | null | undefined) => {
  const value = Number(timer);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : null;
};

const getOptionText = (option: ExamOption) => {
  if (typeof option === "string") return option;
  return option.text || option.label || "";
};

const normalizeHtmlText = (value?: string | null) =>
  (value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const getPlainTextLength = (value?: string | null) =>
  (value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim().length;

const getAttemptPercentage = (attempt: AttemptShape | null | undefined) => {
  if (!attempt) return 0;
  return attempt.score?.percentage ?? attempt.summary?.percentage ?? 0;
};

const findOptionIndexByText = (options: ExamOption[], text?: string | null) => {
  const normalized = normalizeHtmlText(text);
  if (!normalized) return null;
  const index = options.findIndex((option) => normalizeHtmlText(getOptionText(option)) === normalized);
  return index >= 0 ? index : null;
};

const resolveOptionIndex = (
  options: ExamOption[],
  explicitIndex: number | null | undefined,
  optionText?: string | null
) => {
  if (typeof explicitIndex === "number" && explicitIndex >= 0 && explicitIndex < options.length) {
    return explicitIndex;
  }
  return findOptionIndexByText(options, optionText);
};

const buildReviewByQuestionId = (result: ExamSubmitResponse["data"] | null) => {
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

const optionToneClasses = [
  "bg-sky-500/8 hover:bg-sky-500/12",
  "bg-emerald-500/8 hover:bg-emerald-500/12",
  "bg-amber-500/8 hover:bg-amber-500/12",
  "bg-rose-500/8 hover:bg-rose-500/12",
];

const ExamTake: React.FC = () => {
  const { courseId = "", examId = "" } = useParams();
  const { lang, dir } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["exam-take", examId],
    queryFn: () => apiFetch<ExamTakeResponse>(`/courses/${courseId}/exams/${examId}/take`),
    enabled: Boolean(examId),
  });

  useQuery({
    queryKey: ["exam-latest", examId],
    queryFn: () => apiFetch(`/courses/${courseId}/exams/${examId}/my-latest-attempt`),
    enabled: Boolean(examId),
  });

  const questions = data?.data?.questions ?? [];
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(() => new Set());
  const [result, setResult] = useState<ExamSubmitResponse["data"] | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [explanationOpen, setExplanationOpen] = useState(true);
  const [desktopWrapWidthPx, setDesktopWrapWidthPx] = useState(readStoredDesktopWrapWidth);
  const [isDesktopViewport, setIsDesktopViewport] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(MD_QUERY).matches : true
  );
  const promptBoxRef = useRef<HTMLDivElement>(null);

  const isReviewMode = Boolean(result);
  const wrapWidthPx = desktopWrapWidthPx || DESKTOP_WRAP_FALLBACK_PX;

  const reviewByQuestionId = useMemo(() => buildReviewByQuestionId(result), [result]);

  React.useEffect(() => {
    if (questions.length && answers.length !== questions.length) {
      setAnswers(Array.from({ length: questions.length }).map((_, i) => answers[i] ?? null));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions.length]);

  React.useEffect(() => {
    setExplanationOpen(true);
  }, [index]);

  const toggleFlag = () => {
    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const mutation = useMutation({
    mutationFn: (payload: { answers: { questionId: string; selectedOptionIndex: number | null }[] }) =>
      apiFetch<ExamSubmitResponse>(`/courses/${courseId}/exams/${examId}/submit`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: (res) => {
      toast({
        title: lang === "ar" ? "تم الإرسال" : "נשלח",
        description: lang === "ar" ? "تم تسليم إجابتك" : "התשובה נשלחה",
      });
      queryClient.invalidateQueries({ queryKey: ["exam-take", examId] });
      queryClient.invalidateQueries({ queryKey: ["exam-latest", examId] });
      setResult(res.data);
      setIndex(0);
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Failed";
      toast({ title: "Error", description: message });
    },
  });

  const current = questions[index] || null;
  const isLongQuestion = getPlainTextLength(current?.prompt) >= LONG_QUESTION_CHAR_THRESHOLD;
  const lockPromptWidthOnMobile = isLongQuestion && !isDesktopViewport;
  const questionTimerSeconds = getQuestionTimerSeconds(current?.timer);
  const currentReview = current ? reviewByQuestionId.get(current.id) : undefined;
  const correctOptionIndex = current
    ? resolveOptionIndex(current.options, currentReview?.correctOptionIndex, currentReview?.correctOptionText)
    : null;
  const selectedOptionIndex = current
    ? resolveOptionIndex(
      current.options,
      currentReview?.selectedOptionIndex ?? answers[index],
      currentReview?.selectedOptionText
    )
    : answers[index];

  // Track md viewport
  useEffect(() => {
    const mq = window.matchMedia(MD_QUERY);
    const sync = () => setIsDesktopViewport(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Capture desktop prompt wrap width
  useEffect(() => {
    const el = promptBoxRef.current;
    if (!el) return;

    const mq = window.matchMedia(MD_QUERY);
    const publishWidth = (width: number) => {
      if (width <= 200) return;
      setDesktopWrapWidthPx(width);
      window.sessionStorage.setItem(DESKTOP_WRAP_STORAGE_KEY, String(width));
    };

    const measureVisible = () => {
      if (!mq.matches) return;
      publishWidth(el.clientWidth);
    };

    measureVisible();
    const ro = new ResizeObserver(measureVisible);
    ro.observe(el);
    mq.addEventListener("change", measureVisible);

    return () => {
      ro.disconnect();
      mq.removeEventListener("change", measureVisible);
    };
  }, [current?.id, current?.prompt]);

  React.useEffect(() => {
    setRemainingSeconds(questionTimerSeconds);
  }, [index, current?.id, questionTimerSeconds]);

  React.useEffect(() => {
    if (isReviewMode || questionTimerSeconds == null || remainingSeconds == null) return;

    if (remainingSeconds <= 0) {
      if (index < questions.length - 1) {
        setIndex((currentIndex) => currentIndex + 1);
      }
      return;
    }

    const intervalId = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev == null) return prev;
        return Math.max(0, prev - 1);
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isReviewMode, questionTimerSeconds, remainingSeconds, index, questions.length]);

  const selectOption = (optIndex: number) => {
    if (isReviewMode) return;

    setAnswers((a) => {
      const copy = [...a];
      copy[index] = optIndex;
      return copy;
    });

    if (index >= questions.length - 1) return;

    const questionIndex = index;
    window.setTimeout(() => {
      setIndex((currentIndex) => (currentIndex === questionIndex ? currentIndex + 1 : currentIndex));
    }, 450);
  };

  const submit = () => {
    if (isReviewMode) return;
    const payload = {
      answers: answers.map((s, i) => ({ questionId: questions[i].id, selectedOptionIndex: s })),
    };
    mutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="text-center text-muted-foreground">
        {lang === "ar" ? "جارٍ التحميل..." : "טוען..."}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center text-muted-foreground">
        {lang === "ar" ? "لا يوجد امتحان لعرضه الآن" : "אין בחינה להצגה כרגע"}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {isReviewMode ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
          <p className="text-sm font-semibold text-emerald-800">
            {lang === "ar"
              ? `العلامة: ${getAttemptPercentage(result?.attempt)}%`
              : `ציון: ${getAttemptPercentage(result?.attempt)}%`}
          </p>
          {result?.previousAttempt ? (
            <p className="mt-1 text-xs text-muted-foreground">
              {lang === "ar"
                ? `المحاولة السابقة: ${getAttemptPercentage(result.previousAttempt)}%`
                : `ניסיון קודם: ${getAttemptPercentage(result.previousAttempt)}%`}
            </p>
          ) : null}
          <p className="mt-1 text-xs text-muted-foreground">
            {lang === "ar"
              ? "راجع إجاباتك بالتنقل بين الأسئلة. الإجابة الصحيحة بالأخضر والخاطئة بالأحمر."
              : "עברו בין השאלות לסקירת התשובות. הנכונה בירוק והשגויה באדום."}
          </p>
        </div>
      ) : null}

      {current ? (
        <>
          <div className="py-1" dir={dir}>
            <p className="mb-3 text-xs font-semibold text-amber-800">
              {lang === "ar" ? "انتقل إلى سؤال" : "עבור לשאלה"}
            </p>
            <div className="flex flex-wrap gap-2">
              {questions.map((question, questionIndex) => {
                const isCurrent = questionIndex === index;
                const isAnswered = answers[questionIndex] != null;
                const isFlagged = flaggedQuestions.has(questionIndex);
                const reviewStatus = reviewByQuestionId.get(question.id)?.status;

                const reviewClass =
                  reviewStatus === "correct"
                    ? "bg-emerald-500/90 text-white hover:bg-emerald-500"
                    : reviewStatus === "wrong"
                      ? "bg-rose-500/90 text-white hover:bg-rose-500"
                      : reviewStatus === "unanswered"
                        ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                        : null;

                return (
                  <button
                    key={question.id || questionIndex}
                    type="button"
                    onClick={() => setIndex(questionIndex)}
                    className={cn(
                      "relative min-w-9 h-9 px-2 rounded-lg text-sm font-bold transition-all",
                      isCurrent
                        ? "bg-amber-500 text-white ring-2 ring-amber-600 ring-offset-1"
                        : isReviewMode && reviewClass
                          ? reviewClass
                          : isAnswered
                            ? "bg-emerald-500/90 text-white hover:bg-emerald-500"
                            : "bg-white border border-amber-300 text-amber-900 hover:bg-amber-100"
                    )}
                    aria-current={isCurrent ? "step" : undefined}
                    title={
                      lang === "ar"
                        ? `السؤال ${questionIndex + 1}${isFlagged ? " (معلّم)" : ""}`
                        : `שאלה ${questionIndex + 1}${isFlagged ? " (מסומן)" : ""}`
                    }
                  >
                    {questionIndex + 1}
                    {isFlagged ? (
                      <span className="absolute -top-1 -end-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-white shadow-sm">
                        <Bookmark className="h-2.5 w-2.5 fill-current" />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className={cn(
              "relative -mx-2 rounded-2xl border border-border bg-white p-3 shadow-sm sm:p-4 md:mx-0 md:p-6",
              lockPromptWidthOnMobile &&
              "overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]"
            )}
            dir={dir}
          >
            {!isReviewMode && questionTimerSeconds != null && remainingSeconds != null ? (
              <div
                className={cn(
                  "mb-4 rounded-xl border px-4 py-2 text-center text-sm font-semibold",
                  remainingSeconds <= 5
                    ? "border-rose-500/40 bg-rose-500/10 text-rose-600"
                    : "border-primary/30 bg-primary/10 text-primary"
                )}
              >
                {lang === "ar"
                  ? `الوقت المتبقي: ${remainingSeconds} ثانية`
                  : `זמן נותר: ${remainingSeconds} שניות`}
              </div>
            ) : null}

            {isReviewMode && currentReview ? (
              <div
                className={cn(
                  "mb-4 rounded-xl border px-4 py-2 text-center text-sm font-semibold",
                  currentReview.status === "correct"
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700"
                    : currentReview.status === "wrong"
                      ? "border-rose-500/40 bg-rose-500/10 text-rose-700"
                      : "border-slate-300 bg-slate-100 text-slate-700"
                )}
              >
                {currentReview.status === "correct"
                  ? lang === "ar"
                    ? "إجابتك صحيحة"
                    : "התשובה נכונה"
                  : currentReview.status === "wrong"
                    ? lang === "ar"
                      ? "إجابتك خاطئة"
                      : "התשובה שגויה"
                    : lang === "ar"
                      ? "لم تُجَب على هذا السؤال"
                      : "לא נענתה שאלה זו"}
              </div>
            ) : null}

            <div className="w-full">
              <div
                ref={promptBoxRef}
                className="mb-6 w-full"
                style={
                  lockPromptWidthOnMobile
                    ? { width: wrapWidthPx, minWidth: wrapWidthPx }
                    : undefined
                }
              >
                <RichHtmlContent html={current.prompt} className={PROMPT_HTML_CLASS} />
              </div>

              <div
                className="space-y-3"
                style={
                  lockPromptWidthOnMobile
                    ? { width: wrapWidthPx, minWidth: wrapWidthPx }
                    : undefined
                }
              >
                {current.options.map((o: ExamOption, i: number) => {
                  const isSelected = isReviewMode ? selectedOptionIndex === i : answers[index] === i;
                  const isCorrectOption = isReviewMode && correctOptionIndex === i;
                  const isWrongSelection = isReviewMode && isSelected && !isCorrectOption;

                  return (
                    <div
                      key={i}
                      role={isReviewMode ? undefined : "button"}
                      tabIndex={isReviewMode ? -1 : 0}
                      onClick={() => selectOption(i)}
                      onKeyDown={(event) => {
                        if (isReviewMode) return;
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          selectOption(i);
                        }
                      }}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-2xl p-3 text-start shadow-sm transition-all duration-200 sm:p-4",
                        isReviewMode ? "cursor-default" : "cursor-pointer",
                        isReviewMode
                          ? isCorrectOption
                            ? "border border-emerald-500/50 bg-emerald-500/15 ring-2 ring-emerald-500/30"
                            : isWrongSelection
                              ? "border border-rose-500/50 bg-rose-500/15 ring-2 ring-rose-500/30"
                              : "border border-transparent bg-slate-50 text-slate-500"
                          : cn(
                            optionToneClasses[i % optionToneClasses.length],
                            isSelected ? "ring-2 ring-primary/40 scale-[1.01]" : ""
                          )
                      )}
                    >
                      <Checkbox
                        checked={isSelected || Boolean(isCorrectOption)}
                        className="pointer-events-none shrink-0"
                        aria-hidden="true"
                      />
                      <span
                        className={cn(
                          "shrink-0 min-w-[1.5rem] text-center font-semibold",
                          isCorrectOption
                            ? "text-emerald-700"
                            : isWrongSelection
                              ? "text-rose-700"
                              : "text-primary"
                        )}
                      >
                        {i + 1}.
                      </span>
                      <RichHtmlContent
                        html={getOptionText(o)}
                        className={OPTION_HTML_CLASS}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {isReviewMode && currentReview?.explanation ? (
              <Collapsible open={explanationOpen} onOpenChange={setExplanationOpen} className="mt-5">
                <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-slate-100">
                  <span>{lang === "ar" ? "الشرح" : "הסבר"}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      explanationOpen ? "rotate-180" : ""
                    )}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 rounded-xl border border-border bg-white px-4 py-3">
                  <RichHtmlContent
                    html={currentReview.explanation}
                    className="text-sm leading-7 text-muted-foreground"
                  />
                </CollapsibleContent>
              </Collapsible>
            ) : null}
          </div>
        </>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          disabled={index === 0}
          onClick={() => setIndex((s) => Math.max(0, s - 1))}
          className="inline-flex items-center justify-center rounded-full border border-slate-300/60 bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {lang === "ar" ? "السابق" : "הקודם"}
        </button>
        <button
          disabled={index >= questions.length - 1}
          onClick={() => setIndex((s) => Math.min(questions.length - 1, s + 1))}
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-primary via-primary/90 to-primary/80 px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/25 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {lang === "ar" ? "التالي" : "הבא"}
        </button>

        {!isReviewMode ? (
          <button
            type="button"
            onClick={toggleFlag}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold shadow-sm transition-all hover:-translate-y-0.5",
              flaggedQuestions.has(index)
                ? "border-rose-400 bg-rose-500 text-white hover:bg-rose-600"
                : "border-dashed border-amber-400/70 bg-amber-50 text-amber-700 hover:border-amber-500 hover:bg-amber-100"
            )}
          >
            <Bookmark className={cn("w-4 h-4", flaggedQuestions.has(index) ? "fill-current" : "")} />
            {lang === "ar" ? "اشارة تذكير" : "סימן תזכורת"}
          </button>
        ) : null}

        {!isReviewMode ? (
          <div className="ms-auto flex items-center gap-3">
            <button
              onClick={submit}
              disabled={mutation.isPending}
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5 hover:bg-emerald-500 hover:shadow-xl hover:shadow-emerald-600/25 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {lang === "ar" ? "تقديم الاجابات" : "שלח"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ExamTake;
