import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

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
  reviews: Array<{ id: string; notes: string; createdAt: string }>;
  isReviewed: boolean;
  createdAt: string;
  updatedAt: string;
}

const EssayQuestionDetail = () => {
  const { courseId = "", questionId = "" } = useParams();
  const { toast } = useToast();
  const { lang } = useLanguage();
  const queryClient = useQueryClient();
  const [answerText, setAnswerText] = useState("");

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
                  <p className="text-xs text-muted-foreground mt-2">{new Date(review.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">{lang === "ar" ? "لا توجد ملاحظات حتى الآن" : "עדיין אין הערות"}</p>
          )}
        </section>
      </aside>
    </motion.div>
  );
};

export default EssayQuestionDetail;