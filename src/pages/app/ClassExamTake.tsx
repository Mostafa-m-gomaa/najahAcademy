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
import {
  buildReviewByQuestionId,
  CLASS_EXAM_CHAPTER_DURATION_SECONDS,
  formatExamTimer,
  getAttemptPercentage,
  getChapterQuestions,
  getOptionText,
  getPlainTextLength,
  getQuestionTimerSeconds,
  LONG_QUESTION_CHAR_THRESHOLD,
  MD_QUERY,
  OPTION_HTML_CLASS,
  optionToneClasses,
  PROMPT_HTML_CLASS,
  readStoredDesktopWrapWidth,
  resolveOptionIndex,
  DESKTOP_WRAP_FALLBACK_PX,
  DESKTOP_WRAP_STORAGE_KEY,
  type ClassExamSubmitResponse,
  type ClassExamTakeData,
  type ExamPhase,
  type McqQuestion,
  type ReviewChapter,
} from "@/lib/classExams";

type ClassExamTakeResponse = {
  data: ClassExamTakeData;
};

const ClassExamTake: React.FC = () => {
  const { courseId = "", classExamId = "" } = useParams();
  const { lang, dir } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["class-exam-take", classExamId],
    queryFn: () =>
      apiFetch<ClassExamTakeResponse>(`/courses/${courseId}/class-exams/${classExamId}/take`),
    enabled: Boolean(classExamId),
  });

  const chapter1Questions = useMemo(
    () => getChapterQuestions(data?.data.chapters ?? {}, 1),
    [data?.data.chapters]
  );
  const chapter2Questions = useMemo(
    () => getChapterQuestions(data?.data.chapters ?? {}, 2),
    [data?.data.chapters]
  );
  const essayQuestion = data?.data.essayQuestion ?? null;

  const [phase, setPhase] = useState<ExamPhase>("chapter1");
  const [reviewChapter, setReviewChapter] = useState<ReviewChapter>(1);
  const [index, setIndex] = useState(0);
  const [chapter1Answers, setChapter1Answers] = useState<(number | null)[]>([]);
  const [chapter2Answers, setChapter2Answers] = useState<(number | null)[]>([]);
  const [essayAnswer, setEssayAnswer] = useState("");
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(() => new Set());
  const [result, setResult] = useState<ClassExamSubmitResponse["data"] | null>(null);
  const [chapterRemainingSeconds, setChapterRemainingSeconds] = useState(CLASS_EXAM_CHAPTER_DURATION_SECONDS);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [explanationOpen, setExplanationOpen] = useState(true);
  const [desktopWrapWidthPx, setDesktopWrapWidthPx] = useState(readStoredDesktopWrapWidth);
  const [isDesktopViewport, setIsDesktopViewport] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(MD_QUERY).matches : true
  );
  const promptBoxRef = useRef<HTMLDivElement>(null);
  const chapterTimeoutHandledRef = useRef(false);
  const chapter1AnswersRef = useRef(chapter1Answers);
  const chapter2AnswersRef = useRef(chapter2Answers);
  const essayAnswerRef = useRef(essayAnswer);

  const isReviewMode = phase === "review";
  const wrapWidthPx = desktopWrapWidthPx || DESKTOP_WRAP_FALLBACK_PX;
  const reviewByQuestionId = useMemo(() => buildReviewByQuestionId(result), [result]);

  const activeQuestions: McqQuestion[] = useMemo(() => {
    if (isReviewMode) {
      if (reviewChapter === 1) return chapter1Questions;
      if (reviewChapter === 2) return chapter2Questions;
      return [];
    }
    if (phase === "chapter1") return chapter1Questions;
    if (phase === "chapter2") return chapter2Questions;
    return [];
  }, [isReviewMode, reviewChapter, phase, chapter1Questions, chapter2Questions]);

  const activeAnswers = useMemo(() => {
    if (isReviewMode) {
      if (reviewChapter === 1) return chapter1Answers;
      if (reviewChapter === 2) return chapter2Answers;
      return [];
    }
    if (phase === "chapter1") return chapter1Answers;
    if (phase === "chapter2") return chapter2Answers;
    return [];
  }, [isReviewMode, reviewChapter, phase, chapter1Answers, chapter2Answers]);

  const setActiveAnswers = (updater: (prev: (number | null)[]) => (number | null)[]) => {
    if (isReviewMode) {
      if (reviewChapter === 1) setChapter1Answers(updater);
      else if (reviewChapter === 2) setChapter2Answers(updater);
      return;
    }
    if (phase === "chapter1") setChapter1Answers(updater);
    else if (phase === "chapter2") setChapter2Answers(updater);
  };

  useEffect(() => {
    if (chapter1Questions.length && chapter1Answers.length !== chapter1Questions.length) {
      setChapter1Answers(Array.from({ length: chapter1Questions.length }).map((_, i) => chapter1Answers[i] ?? null));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter1Questions.length]);

  useEffect(() => {
    if (chapter2Questions.length && chapter2Answers.length !== chapter2Questions.length) {
      setChapter2Answers(Array.from({ length: chapter2Questions.length }).map((_, i) => chapter2Answers[i] ?? null));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter2Questions.length]);

  useEffect(() => {
    chapter1AnswersRef.current = chapter1Answers;
  }, [chapter1Answers]);

  useEffect(() => {
    chapter2AnswersRef.current = chapter2Answers;
  }, [chapter2Answers]);

  useEffect(() => {
    essayAnswerRef.current = essayAnswer;
  }, [essayAnswer]);

  useEffect(() => {
    setExplanationOpen(true);
  }, [index, phase, reviewChapter]);

  useEffect(() => {
    setIndex(0);
    setFlaggedQuestions(new Set());
  }, [phase, reviewChapter]);

  useEffect(() => {
    if (isReviewMode) return;
    setChapterRemainingSeconds(CLASS_EXAM_CHAPTER_DURATION_SECONDS);
    chapterTimeoutHandledRef.current = false;
  }, [phase, isReviewMode]);

  const mutation = useMutation({
    mutationFn: (payload: {
      answers: { questionId: string; selectedOptionIndex: number | null }[];
      essayAnswer?: string;
    }) =>
      apiFetch<ClassExamSubmitResponse>(`/courses/${courseId}/class-exams/${classExamId}/submit`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: (res) => {
      toast({
        title: lang === "ar" ? "تم الإرسال" : "נשלח",
        description: lang === "ar" ? "تم تسليم إجابتك" : "התשובה נשלחה",
      });
      queryClient.invalidateQueries({ queryKey: ["class-exams", courseId] });
      queryClient.invalidateQueries({ queryKey: ["class-exam-take", classExamId] });
      setResult(res.data);
      setPhase("review");
      setReviewChapter(1);
      setIndex(0);
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Failed";
      toast({ title: "Error", description: message });
    },
  });

  const current = activeQuestions[index] || null;
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
        currentReview?.selectedOptionIndex ?? activeAnswers[index],
        currentReview?.selectedOptionText
      )
    : activeAnswers[index];

  useEffect(() => {
    const mq = window.matchMedia(MD_QUERY);
    const sync = () => setIsDesktopViewport(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

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

  useEffect(() => {
    setRemainingSeconds(questionTimerSeconds);
  }, [index, current?.id, questionTimerSeconds]);

  useEffect(() => {
    if (isReviewMode || phase === "essay" || questionTimerSeconds == null || remainingSeconds == null) return;

    if (remainingSeconds <= 0) {
      if (index < activeQuestions.length - 1) {
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
  }, [isReviewMode, phase, questionTimerSeconds, remainingSeconds, index, activeQuestions.length]);

  const toggleFlag = () => {
    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const selectOption = (optIndex: number) => {
    if (isReviewMode) return;

    setActiveAnswers((a) => {
      const copy = [...a];
      copy[index] = optIndex;
      return copy;
    });

    if (index >= activeQuestions.length - 1) return;

    const questionIndex = index;
    window.setTimeout(() => {
      setIndex((currentIndex) => (currentIndex === questionIndex ? currentIndex + 1 : currentIndex));
    }, 450);
  };

  const buildSubmitPayload = () => {
    const answers = [
      ...chapter1Questions.map((q, i) => ({
        questionId: q.id,
        selectedOptionIndex: chapter1AnswersRef.current[i] ?? null,
      })),
      ...chapter2Questions.map((q, i) => ({
        questionId: q.id,
        selectedOptionIndex: chapter2AnswersRef.current[i] ?? null,
      })),
    ];

    const payload: {
      answers: { questionId: string; selectedOptionIndex: number | null }[];
      essayAnswer?: string;
    } = { answers };

    if (essayQuestion) {
      payload.essayAnswer = essayAnswerRef.current;
    }

    return payload;
  };

  const submitToApi = () => {
    if (mutation.isPending || isReviewMode) return;
    mutation.mutate(buildSubmitPayload());
  };

  const advanceAfterChapter = () => {
    if (phase === "chapter1") {
      setPhase("chapter2");
      return;
    }
    if (phase === "chapter2") {
      if (essayQuestion) {
        setPhase("essay");
      } else {
        submitToApi();
      }
      return;
    }
    if (phase === "essay") {
      submitToApi();
    }
  };

  const handleChapterTimeout = () => {
    if (mutation.isPending || isReviewMode || chapterTimeoutHandledRef.current) return;
    chapterTimeoutHandledRef.current = true;

    const isFinalChapter =
      phase === "essay" || (phase === "chapter2" && !essayQuestion);

    toast({
      title: lang === "ar" ? "انتهى وقت الفصل" : "זמן הפרק נגמר",
      description: isFinalChapter
        ? lang === "ar"
          ? "تم تسليم إجاباتك تلقائياً"
          : "התשובות נשלחו אוטומטית"
        : lang === "ar"
          ? "انتقلنا للفصل التالي تلقائياً"
          : "עברנו לפרק הבא אוטומטית",
    });

    advanceAfterChapter();
  };

  useEffect(() => {
    if (isReviewMode || mutation.isPending) return;

    if (chapterRemainingSeconds <= 0) {
      handleChapterTimeout();
      return;
    }

    const intervalId = window.setInterval(() => {
      setChapterRemainingSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => window.clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReviewMode, chapterRemainingSeconds, mutation.isPending, phase]);

  const handleChapterSubmit = () => {
    if (phase === "chapter1") {
      setPhase("chapter2");
      return;
    }
    if (phase === "chapter2") {
      if (essayQuestion) {
        setPhase("essay");
      } else {
        submitToApi();
      }
      return;
    }
    if (phase === "essay") {
      submitToApi();
    }
  };

  const chapterLabels = useMemo(
    (): Record<ReviewChapter, string> => ({
      1: lang === "ar" ? "الفصل الأول" : "פרק ראשון",
      2: lang === "ar" ? "الفصل الثاني" : "פרק שני",
      3: lang === "ar" ? "الفصل الثالث" : "פרק שלישי",
    }),
    [lang]
  );

  const phaseLabel = useMemo(() => {
    if (isReviewMode) return chapterLabels[reviewChapter];
    if (phase === "chapter1") return chapterLabels[1];
    if (phase === "chapter2") return chapterLabels[2];
    if (phase === "essay") return chapterLabels[3];
    return "";
  }, [isReviewMode, reviewChapter, phase, chapterLabels]);

  const showMcqSection = !isReviewMode ? phase !== "essay" : reviewChapter !== 3;
  const showEssaySection = !isReviewMode ? phase === "essay" : reviewChapter === 3;

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

  const scorePercentage =
    result?.breakdown?.percentage ?? getAttemptPercentage(result?.attempt ?? null);

  return (
    <div className="space-y-5">
      {data.data.exam.name ? (
        <h2 className="text-lg font-bold text-foreground">{data.data.exam.name}</h2>
      ) : null}

      {!isReviewMode ? (
        <div
          className={cn(
            "sticky top-20 z-20 rounded-2xl border px-4 py-3 text-center shadow-sm backdrop-blur-sm",
            chapterRemainingSeconds <= 60
              ? "border-rose-500/40 bg-rose-500/10 text-rose-700"
              : chapterRemainingSeconds <= 300
                ? "border-amber-500/40 bg-amber-500/10 text-amber-800"
                : "border-primary/30 bg-primary/10 text-primary"
          )}
        >
          <p className="text-xs font-semibold">
            {lang === "ar"
              ? `الوقت المتبقي — ${phaseLabel}`
              : `זמן נותר — ${phaseLabel}`}
          </p>
          <p className="mt-1 text-3xl font-bold tabular-nums tracking-wide">
            {formatExamTimer(chapterRemainingSeconds)}
          </p>
        </div>
      ) : null}

      {isReviewMode ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
          <p className="text-sm font-semibold text-emerald-800">
            {lang === "ar" ? `العلامة: ${scorePercentage}%` : `ציון: ${scorePercentage}%`}
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
              ? "راجع إجاباتك بالتنقل بين الفصول والأسئلة. الإجابة الصحيحة بالأخضر والخاطئة بالأحمر."
              : "עברו בין הפרקים והשאלות לסקירת התשובות. הנכונה בירוק והשגויה באדום."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary">
          {phaseLabel}
        </div>
      )}

      {isReviewMode ? (
        <div className="flex flex-wrap gap-2">
          {([1, 2, 3] as ReviewChapter[]).map((ch) => {
            const disabled = ch === 3 && !essayQuestion;
            if (disabled) return null;
            return (
              <button
                key={ch}
                type="button"
                onClick={() => setReviewChapter(ch)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                  reviewChapter === ch
                    ? "gradient-bg text-primary-foreground"
                    : "bg-white border border-border text-foreground hover:bg-muted"
                )}
              >
                {chapterLabels[ch]}
              </button>
            );
          })}
        </div>
      ) : null}

      {showMcqSection && current ? (
        <>
          <div className="py-1" dir={dir}>
            <p className="mb-3 text-xs font-semibold text-amber-800">
              {lang === "ar" ? "انتقل إلى سؤال" : "עבור לשאלה"}
            </p>
            <div className="flex flex-wrap gap-2">
              {activeQuestions.map((question, questionIndex) => {
                const isCurrent = questionIndex === index;
                const isAnswered = activeAnswers[questionIndex] != null;
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
                {current.options.map((o, i) => {
                  const isSelected = isReviewMode ? selectedOptionIndex === i : activeAnswers[index] === i;
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
                      <RichHtmlContent html={getOptionText(o)} className={OPTION_HTML_CLASS} />
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

      {showMcqSection && !current && activeQuestions.length === 0 ? (
        <div className="glass-card rounded-2xl p-6 text-center text-muted-foreground">
          {lang === "ar" ? "لا توجد أسئلة في هذا الفصل" : "אין שאלות בפרק זה"}
        </div>
      ) : null}

      {showMcqSection && !isReviewMode && activeQuestions.length === 0 ? (
        <div className="flex justify-end">
          <button
            onClick={handleChapterSubmit}
            disabled={mutation.isPending}
            className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5 hover:bg-emerald-500 hover:shadow-xl hover:shadow-emerald-600/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {lang === "ar" ? "تسليم" : "שליחה"}
          </button>
        </div>
      ) : null}

      {showEssaySection && essayQuestion ? (
        <div className="rounded-2xl border border-border bg-white p-4 sm:p-6 shadow-sm space-y-4" dir={dir}>
          <div>
            <h3 className="text-lg font-bold text-foreground">{essayQuestion.title}</h3>
            <RichHtmlContent
              html={essayQuestion.question}
              className="mt-3 text-foreground leading-7"
            />
            {essayQuestion.description ? (
              <RichHtmlContent
                html={essayQuestion.description}
                className="mt-2 text-sm text-muted-foreground leading-6"
              />
            ) : null}
          </div>

          {isReviewMode ? (
            <div className="rounded-xl border border-border bg-slate-50 p-4">
              <p className="text-xs font-semibold text-muted-foreground mb-2">
                {lang === "ar" ? "إجابتك" : "התשובה שלך"}
              </p>
              <p className="text-sm leading-7 whitespace-pre-wrap">
                {result?.attempt?.essayAnswer?.answerText || essayAnswer || "—"}
              </p>
            </div>
          ) : (
            <textarea
              value={essayAnswer}
              onChange={(e) => setEssayAnswer(e.target.value)}
              rows={8}
              placeholder={lang === "ar" ? "اكتب إجابتك هنا..." : "כתבו את התשובה כאן..."}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm leading-7 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y min-h-[160px]"
            />
          )}
        </div>
      ) : null}

      {showMcqSection && activeQuestions.length > 0 ? (
        <div className="flex flex-wrap items-center gap-3">
          <button
            disabled={index === 0}
            onClick={() => setIndex((s) => Math.max(0, s - 1))}
            className="inline-flex items-center justify-center rounded-full border border-slate-300/60 bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {lang === "ar" ? "السابق" : "הקודם"}
          </button>
          <button
            disabled={index >= activeQuestions.length - 1}
            onClick={() => setIndex((s) => Math.min(activeQuestions.length - 1, s + 1))}
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
                onClick={handleChapterSubmit}
                disabled={mutation.isPending}
                className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5 hover:bg-emerald-500 hover:shadow-xl hover:shadow-emerald-600/25 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {lang === "ar" ? "تسليم" : "שליחה"}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {showEssaySection && !isReviewMode ? (
        <div className="flex justify-end">
          <button
            onClick={handleChapterSubmit}
            disabled={mutation.isPending}
            className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5 hover:bg-emerald-500 hover:shadow-xl hover:shadow-emerald-600/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {lang === "ar" ? "تسليم" : "שליחה"}
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default ClassExamTake;
