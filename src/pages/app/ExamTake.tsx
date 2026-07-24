import React, { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bookmark } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import RichHtmlContent from "@/components/RichHtmlContent";
import { Checkbox } from "@/components/ui/checkbox";

type ExamOption = string | { text?: string; label?: string };

type ExamQuestion = {
  id: string;
  prompt: string;
  options: ExamOption[];
  timer?: number | null;
};

const getQuestionTimerSeconds = (timer: number | null | undefined) => {
  const value = Number(timer);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : null;
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
    correct?: unknown[];
    wrong?: unknown[];
    unanswered?: unknown[];
    attempt?: AttemptShape | null;
    previousAttempt?: AttemptShape | null;
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

const getOptionText = (option: ExamOption) => {
  if (typeof option === "string") return option;
  return option.text || option.label || "";
};

const getAttemptPercentage = (attempt: AttemptShape | null | undefined) => {
  if (!attempt) return 0;
  return attempt.score?.percentage ?? attempt.summary?.percentage ?? 0;
};

const optionToneClasses = [
  "bg-sky-500/8 hover:bg-sky-500/12",
  "bg-emerald-500/8 hover:bg-emerald-500/12",
  "bg-amber-500/8 hover:bg-amber-500/12",
  "bg-rose-500/8 hover:bg-rose-500/12"
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
  const [answers, setAnswers] = useState<number[] | null[]>(() => questions.map(() => null));
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(() => new Set());

  // keep answers length in sync if questions load later
  React.useEffect(() => {
    if (questions.length && answers.length !== questions.length) {
      setAnswers(Array.from({ length: questions.length }).map((_, i) => answers[i] ?? null));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions.length]);

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
      toast({ title: lang === "ar" ? "تم الإرسال" : "נשלח", description: lang === "ar" ? "تم تسليم إجابتك" : "התשובה נשלחה" });
      queryClient.invalidateQueries({ queryKey: ["exam-take", examId] });
      queryClient.invalidateQueries({ queryKey: ["exam-latest", examId] });
      setResult(res.data);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err?.message || "Failed" });
    },
  });

  const [result, setResult] = useState<any>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  const current = questions[index] || null;
  const questionTimerSeconds = getQuestionTimerSeconds(current?.timer);

  React.useEffect(() => {
    setRemainingSeconds(questionTimerSeconds);
  }, [index, current?.id, questionTimerSeconds]);

  React.useEffect(() => {
    if (result || questionTimerSeconds == null || remainingSeconds == null) return;

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
  }, [result, questionTimerSeconds, remainingSeconds, index, questions.length]);

  const selectOption = (optIndex: number) => {
    setAnswers((a) => {
      const copy = [...a];
      copy[index] = optIndex;
      return copy;
    });

    if (index < questions.length - 1) {
      setIndex((currentIndex) => currentIndex + 1);
    }
  };

  const submit = () => {
    const payload = { answers: answers.map((s, i) => ({ questionId: questions[i].id, selectedOptionIndex: s })) };
    mutation.mutate(payload);
  };

  const summary = useMemo(() => {
    if (!result) return null;
    return {
      correct: result.correct || [],
      wrong: result.wrong || [],
      unanswered: result.unanswered || [],
      score: result.attempt || null,
      previous: result.previousAttempt || null,
    };
  }, [result]);

  if (isLoading) return <div className="text-center text-muted-foreground">{lang === "ar" ? "جارٍ التحميل..." : "טוען..."}</div>;

  if (!data) {
    return <div className="text-center text-muted-foreground">{lang === "ar" ? "لا يوجد امتحان لعرضه الآن" : "אין בחינה להצגה כרגע"}</div>;
  }

  if (result) {
    return (
      <div className="space-y-6">
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold">{lang === "ar" ? "النتيجة" : "תוצאה"}</h2>
          <p className="mt-2">{lang === "ar" ? `العلامة: ${getAttemptPercentage(summary.score)}%` : `ציון: ${getAttemptPercentage(summary.score)}%`}</p>
          {summary.previous ? <p className="text-sm text-muted-foreground">{lang === "ar" ? `المحاولة السابقة: ${getAttemptPercentage(summary.previous)}%` : `ניסיון קודם: ${getAttemptPercentage(summary.previous)}%`}</p> : null}
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="glass-card p-4">
            <h3 className="font-semibold">{lang === "ar" ? "صحيح" : "נכון"}</h3>
            <ul className="mt-3 space-y-2">
              {summary.correct.map((q: any) => (
                <li key={q.questionId} className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm text-success">
                  <RichHtmlContent html={q.prompt || q.questionSnapshot?.prompt} className="font-medium" />
                  {q.correctOptionText ? (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {lang === "ar" ? "الإجابة الصحيحة" : "התשובה הנכונה"}:{" "}
                      <RichHtmlContent html={q.correctOptionText} className="inline" />
                    </div>
                  ) : null}
                  {q.explanation ? <RichHtmlContent html={q.explanation} className="mt-2 text-xs leading-6 text-muted-foreground" /> : null}
                </li>
              ))}
            </ul>
          </div>
          <div className="glass-card p-4">
            <h3 className="font-semibold">{lang === "ar" ? "خاطئ" : "שגוי"}</h3>
            <ul className="mt-3 space-y-2">
              {summary.wrong.map((q: any) => (
                <li key={q.questionId} className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
                  <RichHtmlContent html={q.prompt || q.questionSnapshot?.prompt} className="font-medium" />
                  {q.selectedOptionText ? (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {lang === "ar" ? "إجابتك" : "התשובה שלך"}:{" "}
                      <RichHtmlContent html={q.selectedOptionText} className="inline" />
                    </div>
                  ) : null}
                  {q.correctOptionText ? (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {lang === "ar" ? "الإجابة الصحيحة" : "התשובה הנכונה"}:{" "}
                      <RichHtmlContent html={q.correctOptionText} className="inline" />
                    </div>
                  ) : null}
                  {q.explanation ? <RichHtmlContent html={q.explanation} className="mt-2 text-xs leading-6 text-muted-foreground" /> : null}
                </li>
              ))}
            </ul>
          </div>
          <div className="glass-card p-4">
            <h3 className="font-semibold">{lang === "ar" ? "لم يُجب" : "לא בהתאם"}</h3>
            <ul className="mt-3 space-y-2">
              {summary.unanswered.map((q: any) => (
                <li key={q.questionId} className="rounded-xl border border-border/70 bg-secondary/30 p-3 text-sm text-muted-foreground">
                  <RichHtmlContent html={q.prompt || q.questionSnapshot?.prompt} className="font-medium text-foreground" />
                  {q.correctOptionText ? (
                    <div className="mt-1 text-xs">
                      {lang === "ar" ? "الإجابة الصحيحة" : "התשובה הנכונה"}:{" "}
                      <RichHtmlContent html={q.correctOptionText} className="inline" />
                    </div>
                  ) : null}
                  {q.explanation ? <RichHtmlContent html={q.explanation} className="mt-2 text-xs leading-6" /> : null}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {current ? (
        <>
          <div className="py-1" dir={dir}>
            <p className="text-xs font-semibold text-amber-800 mb-3">
              {lang === "ar" ? "انتقل إلى سؤال" : "עבור לשאלה"}
            </p>
            <div className="flex flex-wrap gap-2">
              {questions.map((_, questionIndex) => {
                const isCurrent = questionIndex === index;
                const isAnswered = answers[questionIndex] != null;
                const isFlagged = flaggedQuestions.has(questionIndex);

                return (
                  <button
                    key={questions[questionIndex].id || questionIndex}
                    type="button"
                    onClick={() => setIndex(questionIndex)}
                    className={`relative min-w-9 h-9 px-2 rounded-lg text-sm font-bold transition-all ${isCurrent
                      ? "bg-amber-500 text-white ring-2 ring-amber-600 ring-offset-1"
                      : isAnswered
                        ? "bg-emerald-500/90 text-white hover:bg-emerald-500"
                        : "bg-white border border-amber-300 text-amber-900 hover:bg-amber-100"
                      }`}
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

          <div className="rounded-2xl border border-border bg-white p-5 md:p-6 shadow-sm" dir={dir}>
            {questionTimerSeconds != null && remainingSeconds != null ? (
              <div
                className={`mb-4 rounded-xl border px-4 py-2 text-sm font-semibold text-center ${remainingSeconds <= 5
                  ? "border-rose-500/40 bg-rose-500/10 text-rose-600"
                  : "border-primary/30 bg-primary/10 text-primary"
                  }`}
              >
                {lang === "ar"
                  ? `الوقت المتبقي: ${remainingSeconds} ثانية`
                  : `זמן נותר: ${remainingSeconds} שניות`}
              </div>
            ) : null}

            <div className="w-full md:w-[70%] md:me-auto mb-6  ">
              <RichHtmlContent html={current.prompt} className="font-medium text-right text-foreground [&_p]:text-right" />
            </div>

            <div className="space-y-3">
              {current.options.map((o: ExamOption, i: number) => {
                const isSelected = answers[index] === i;

                return (
                  <div
                    key={i}
                    role="button"
                    tabIndex={0}
                    onClick={() => selectOption(i)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        selectOption(i);
                      }
                    }}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all duration-200 shadow-sm cursor-pointer text-right ${optionToneClasses[i % optionToneClasses.length]} ${isSelected ? "ring-2 ring-primary/40 scale-[1.01]" : ""}`}
                  >
                    <Checkbox
                      checked={isSelected}
                      className="pointer-events-none shrink-0"
                      aria-hidden="true"
                    />
                    <span className="shrink-0 font-semibold text-primary min-w-[1.5rem] text-center">
                      {i + 1}.
                    </span>
                    <RichHtmlContent html={getOptionText(o)} className="flex-1 text-right" />
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : null}

      <div className="flex items-center gap-3 flex-wrap">
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
        <button
          type="button"
          onClick={toggleFlag}
          className={`inline-flex items-center justify-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold shadow-sm transition-all hover:-translate-y-0.5 ${flaggedQuestions.has(index)
            ? "border-rose-400 bg-rose-500 text-white hover:bg-rose-600"
            : "border-dashed border-amber-400/70 bg-amber-50 text-amber-700 hover:border-amber-500 hover:bg-amber-100"
            }`}
        >
          <Bookmark className={`w-4 h-4 ${flaggedQuestions.has(index) ? "fill-current" : ""}`} />
          {lang === "ar" ? "اشارة تذكير" : "סימן תזכורת"}
        </button>

        <div className="ms-auto flex items-center gap-3">
          <button
            onClick={submit}
            className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5 hover:bg-emerald-500 hover:shadow-xl hover:shadow-emerald-600/25"
          >
            {lang === "ar" ? "تقديم الاجابات" : "שלח"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamTake;
