import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface EssayQuestion {
  id: string;
  courseId: string;
  title: string;
  question: string;
  description?: string;
  isActive: boolean;
}

interface EssayAnswer {
  id: string;
  courseId: string;
  questionId: string;
  studentId: string;
  answerText: string;
  reviews: Array<{ id: string; notes: string; reviewedAt?: string; createdAt?: string; reviewedBy?: string }>;
  isReviewed: boolean;
  createdAt: string;
  updatedAt: string;
}

type AiReviewResponse = {
  success: boolean;
  message?: string;
  data: {
    aiReview: {
      accuracyPercent: number;
      notes: string;
    };
    attempts: {
      usedToday: number;
      limitPerDay: number;
      remainingToday: number;
    };
    answer: EssayAnswer;
  };
};

const formatDateTime = (value: string | undefined, lang: "ar" | "he") => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat(lang === "ar" ? "ar-EG" : "he-IL", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
};

const EssayQuestionDetail = () => {
  const { courseId = "", questionId = "" } = useParams();
  const { toast } = useToast();
  const { lang } = useLanguage();
  const queryClient = useQueryClient();
  const [answerText, setAnswerText] = useState("");
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiResult, setAiResult] = useState<AiReviewResponse["data"] | null>(null);

  const questionQuery = useQuery({
    queryKey: ["essay-question-detail", courseId],
    queryFn: () => apiFetch<{ data: { questions: EssayQuestion[] } }>(`/courses/${courseId}/essay-questions`),
    enabled: Boolean(courseId)
  });

  const myAnswerQuery = useQuery({
    queryKey: ["my-essay-answer", courseId, questionId],
    queryFn: () => apiFetch<{ data: { answer: EssayAnswer | null } }>(`/courses/${courseId}/essay-questions/${questionId}/my-answer`),
    enabled: Boolean(courseId && questionId)
  });

  useEffect(() => {
    if (myAnswerQuery.data?.data.answer) {
      setAnswerText(myAnswerQuery.data.data.answer.answerText);
    }
  }, [myAnswerQuery.data]);

  const question = useMemo(
    () => questionQuery.data?.data.questions.find((item) => item.id === questionId),
    [questionId, questionQuery.data]
  );

  const submitMutation = useMutation({
    mutationFn: async () =>
      apiFetch<{ data: { answer: EssayAnswer } }>(`/courses/${courseId}/essay-questions/${questionId}/answer`, {
        method: "POST",
        body: JSON.stringify({ answerText })
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["my-essay-answer", courseId, questionId] });
      toast({
        title: lang === "ar" ? "تم الإرسال بنجاح ✓" : "נשלח בהצלחה ✓",
        description: lang === "ar" ? "تم إرسال إجابتك للتصحيح" : "התשובה שלך נשלחה לבדיקה",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: lang === "ar" ? "حدث خطأ ✗" : "אירעה שגיאה ✗",
        description: (error as Error).message || (lang === "ar" ? "فشل إرسال الإجابة" : "הנתונים לא נשלחו"),
        variant: "destructive"
      });
    }
  });

  const aiReviewMutation = useMutation({
    mutationFn: async () => {
      const text = answerText.trim();
      if (!text) {
        throw new Error(lang === "ar" ? "اكتب إجابتك أولًا" : "אנא כתבו תשובה תחילה");
      }

      return apiFetch<AiReviewResponse>(`/courses/${courseId}/essay-questions/${questionId}/ai-review`, {
        method: "POST",
        body: JSON.stringify({ answerText: text })
      });
    },
    onSuccess: async (response) => {
      setAiResult(response.data);
      setAiDialogOpen(true);
      await queryClient.invalidateQueries({ queryKey: ["my-essay-answer", courseId, questionId] });
    },
    onError: (error) => {
      toast({
        title: lang === "ar" ? "فشل تصحيح الذكاء الاصطناعي ✗" : "בדיקת AI נכשלה ✗",
        description: (error as Error).message,
        variant: "destructive"
      });
    }
  });

  if (questionQuery.isLoading || myAnswerQuery.isLoading) {
    return <div className="text-center text-muted-foreground">{lang === "ar" ? "جارٍ التحميل..." : "טוען..."}</div>;
  }

  if (questionQuery.error) {
    return <div className="text-center text-destructive">{(questionQuery.error as Error).message}</div>;
  }

  if (!question) {
    return <div className="text-center text-muted-foreground">{lang === "ar" ? "السؤال غير موجود" : "השאלה לא נמצאה"}</div>;
  }

  const answer = myAnswerQuery.data?.data.answer;

  return (
    <>
      <AlertDialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {lang === "ar" ? "نتيجة التصحيح بالذكاء الاصطناعي" : "תוצאת בדיקת AI"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {aiResult
                ? (lang === "ar"
                  ? `المتبقي اليوم: ${aiResult.attempts.remainingToday} من ${aiResult.attempts.limitPerDay}`
                  : `היום נשארו: ${aiResult.attempts.remainingToday} מתוך ${aiResult.attempts.limitPerDay}`)
                : (lang === "ar" ? "جارٍ التحضير..." : "טוען...")}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {aiResult ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-border/60 bg-secondary/30 p-4">
                <p className="text-sm text-muted-foreground mb-1">{lang === "ar" ? "نسبة الدقة" : "דיוק"}</p>
                <p className="text-2xl font-bold gradient-text">{aiResult.aiReview.accuracyPercent}%</p>
              </div>

              <div className="rounded-xl border border-border/60 bg-secondary/30 p-4">
                <p className="text-sm text-muted-foreground mb-2">{lang === "ar" ? "الملاحظات" : "הערות"}</p>
                <p className="text-sm leading-7 whitespace-pre-wrap">{aiResult.aiReview.notes}</p>
              </div>
            </div>
          ) : null}

          <AlertDialogFooter>
            <AlertDialogAction>{lang === "ar" ? "إغلاق" : "סגירה"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
      <section className="glass-card rounded-2xl p-6 md:p-8">
        <p className="text-sm text-muted-foreground mb-2">{lang === "ar" ? "تفاصيل السؤال" : "פרטי השאלה"}</p>
        <h1 className="text-2xl font-bold mb-4">{question.title}</h1>
        <p className="text-muted-foreground leading-8 mb-4">{question.question}</p>
        {question.description ? <p className="text-sm text-muted-foreground mb-6">{question.description}</p> : null}

        <label className="block text-sm font-medium mb-2">{lang === "ar" ? "إجابتك" : "התשובה שלך"}</label>
        <textarea
          value={answerText}
          onChange={(event) => setAnswerText(event.target.value)}
          rows={10}
          className="w-full rounded-2xl border border-border bg-secondary/40 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
          placeholder={lang === "ar" ? "اكتب إجابتك هنا..." : "הקלד/י את התשובה כאן..."}
        />

        <button
          type="button"
          disabled={submitMutation.isPending}
          onClick={() => submitMutation.mutate()}
          className="mt-4 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold gradient-bg text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          <Send className="w-4 h-4" />
          {submitMutation.isPending ? (lang === "ar" ? "جارٍ الإرسال..." : "שולח...") : lang === "ar" ? "إرسال للتصحيح" : "שליחה לבדיקה"}
        </button>

        <button
          type="button"
          disabled={aiReviewMutation.isPending}
          onClick={() => aiReviewMutation.mutate()}
          className="group mt-3 relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-r from-primary/90 via-violet-500/90 to-fuchsia-500/90 px-5 py-3 font-semibold text-primary-foreground shadow-[0_10px_35px_-18px_hsl(var(--primary))] transition-all hover:scale-[1.01] hover:shadow-[0_16px_40px_-18px_hsl(var(--primary))] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_45%)] opacity-70 transition-opacity group-hover:opacity-100" />
          <Sparkles className="relative h-4 w-4" />
          {aiReviewMutation.isPending
            ? (lang === "ar" ? "جارٍ التصحيح بالذكاء الاصطناعي..." : "בודק עם AI..." )
            : (lang === "ar" ? "تصحيح بالذكاء الاصطناعي" : "בדיקת AI")}
          <span className="relative h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.9)]" />
        </button>
      </section>

      <aside className="space-y-6">
        <section className="glass-card rounded-2xl p-6 md:p-8">
          <h2 className="text-lg font-semibold mb-4">{lang === "ar" ? "إجابتي الحالية" : "התשובה הנוכחית שלי"}</h2>
          {answer ? (
            <p className="text-muted-foreground leading-7 whitespace-pre-wrap">{answer.answerText}</p>
          ) : (
            <p className="text-muted-foreground">{lang === "ar" ? "لم يتم إرسال إجابة بعد" : "עדיין לא נשלחה תשובה"}</p>
          )}
        </section>

        <section className="glass-card rounded-2xl p-6 md:p-8">
          <h2 className="text-lg font-semibold mb-4">{lang === "ar" ? "ملاحظات الأدمن" : "הערות המנהל"}</h2>
          {answer?.reviews?.length ? (
            <div className="space-y-3">
              {answer.reviews.map((review) => (
                <div key={review.id} className="rounded-xl border border-border/60 bg-secondary/30 p-4">
                  <p className="text-sm leading-7 whitespace-pre-wrap">{review.notes}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDateTime(review.reviewedAt ?? review.createdAt, lang)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">{lang === "ar" ? "لا توجد ملاحظات حتى الآن" : "עדיין אין הערות"}</p>
          )}
        </section>
      </aside>
      </motion.div>
    </>
  );
};

export default EssayQuestionDetail;