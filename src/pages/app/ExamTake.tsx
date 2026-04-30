import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

type ExamOption = string | { text?: string; label?: string };

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
  "border-sky-500/30 bg-sky-500/8 hover:bg-sky-500/12 hover:border-sky-500/50",
  "border-emerald-500/30 bg-emerald-500/8 hover:bg-emerald-500/12 hover:border-emerald-500/50",
  "border-amber-500/30 bg-amber-500/8 hover:bg-amber-500/12 hover:border-amber-500/50",
  "border-rose-500/30 bg-rose-500/8 hover:bg-rose-500/12 hover:border-rose-500/50"
];

const ExamTake: React.FC = () => {
  const { courseId = "", examId = "" } = useParams();
  const { lang } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["exam-take", examId],
    queryFn: () => apiFetch(`/courses/${courseId}/exams/${examId}/take`),
    enabled: Boolean(examId),
  });

  const { data: prevData } = useQuery({
    queryKey: ["exam-latest", examId],
    queryFn: () => apiFetch(`/courses/${courseId}/exams/${examId}/my-latest-attempt`),
    enabled: Boolean(examId),
  });

  const questions: any[] = data?.data?.questions || [];
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[] | null[]>(() => questions.map(() => null));

  // keep answers length in sync if questions load later
  React.useEffect(() => {
    if (questions.length && answers.length !== questions.length) {
      setAnswers(Array.from({ length: questions.length }).map((_, i) => answers[i] ?? null));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions.length]);

  const mutation = useMutation({
    mutationFn: (payload: any) => apiFetch(`/courses/${courseId}/exams/${examId}/submit`, { method: "POST", body: payload }),
    onSuccess: (res) => {
      toast({ title: lang === "ar" ? "تم الإرسال" : "נשלח", description: lang === "ar" ? "تم تسليم إجابتك" : "התשובה נשלחה" });
      queryClient.invalidateQueries(["exam-take", examId]);
      queryClient.invalidateQueries(["exam-latest", examId]);
      // navigate to result view (we'll render same page with response)
      setResult(res.data);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err?.message || "Failed" });
    },
  });

  const [result, setResult] = useState<any>(null);

  const current = questions[index] || null;

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
                  <div className="font-medium">{q.prompt || q.questionSnapshot?.prompt}</div>
                  {q.correctOptionText ? <div className="mt-1 text-xs text-muted-foreground">{lang === "ar" ? "الإجابة الصحيحة" : "התשובה הנכונה"}: {q.correctOptionText}</div> : null}
                  {q.explanation ? <div className="mt-2 text-xs leading-6 text-muted-foreground whitespace-pre-wrap">{q.explanation}</div> : null}
                </li>
              ))}
            </ul>
          </div>
          <div className="glass-card p-4">
            <h3 className="font-semibold">{lang === "ar" ? "خاطئ" : "שגוי"}</h3>
            <ul className="mt-3 space-y-2">
              {summary.wrong.map((q: any) => (
                <li key={q.questionId} className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
                  <div className="font-medium">{q.prompt || q.questionSnapshot?.prompt}</div>
                  {q.selectedOptionText ? (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {lang === "ar" ? "إجابتك" : "התשובה שלך"}: {q.selectedOptionText}
                    </div>
                  ) : null}
                  {q.correctOptionText ? (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {lang === "ar" ? "الإجابة الصحيحة" : "התשובה הנכונה"}: {q.correctOptionText}
                    </div>
                  ) : null}
                  {q.explanation ? <div className="mt-2 text-xs leading-6 text-muted-foreground whitespace-pre-wrap">{q.explanation}</div> : null}
                </li>
              ))}
            </ul>
          </div>
          <div className="glass-card p-4">
            <h3 className="font-semibold">{lang === "ar" ? "لم يُجب" : "לא בהתאם"}</h3>
            <ul className="mt-3 space-y-2">
              {summary.unanswered.map((q: any) => (
                <li key={q.questionId} className="rounded-xl border border-border/70 bg-secondary/30 p-3 text-sm text-muted-foreground">
                  <div className="font-medium text-foreground">{q.prompt || q.questionSnapshot?.prompt}</div>
                  {q.correctOptionText ? (
                    <div className="mt-1 text-xs">
                      {lang === "ar" ? "الإجابة الصحيحة" : "התשובה הנכונה"}: {q.correctOptionText}
                    </div>
                  ) : null}
                  {q.explanation ? <div className="mt-2 text-xs leading-6 whitespace-pre-wrap">{q.explanation}</div> : null}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold">{data?.data?.exam?.name}</h2>
        <p className="text-sm text-muted-foreground mt-1">{data?.data?.exam?.description}</p>
        <div className="mt-3 text-sm">{lang === "ar" ? `السؤال ${index + 1} من ${questions.length}` : `שאלה ${index + 1} מתוך ${questions.length}`}</div>
      </div>

      {current ? (
        <div className="glass-card p-6">
          <div className="prose">
            <div className="font-medium mb-4">{current.prompt}</div>
            <div className="space-y-3">
              {current.options.map((o: ExamOption, i: number) => (
                <button
                  key={i}
                  onClick={() => selectOption(i)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 shadow-sm ${optionToneClasses[i % optionToneClasses.length]} ${answers[index] === i ? "ring-2 ring-primary/40 scale-[1.01]" : ""}`}
                >
                  {getOptionText(o)}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex items-center gap-3">
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
          onClick={() => setIndex((s) => Math.min(questions.length - 1, s + 1))}
          className="inline-flex items-center justify-center rounded-full border border-dashed border-amber-400/70 bg-amber-50 px-5 py-2.5 text-sm font-semibold text-amber-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-amber-500 hover:bg-amber-100"
        >
          {lang === "ar" ? "تخطي" : "דלג"}
        </button>

        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={submit}
            className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5 hover:bg-emerald-500 hover:shadow-xl hover:shadow-emerald-600/25"
          >
            {lang === "ar" ? "تقديم" : "שלח"}
          </button>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center rounded-full border border-border bg-white px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:bg-secondary/60"
          >
            {lang === "ar" ? "رجوع" : "חזור"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamTake;
