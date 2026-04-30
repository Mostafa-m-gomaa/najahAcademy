import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface CourseLite { id: string; title: string; }
interface EssayQuestion {
  id: string;
  courseId: string;
  title: string;
  question: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
  question?: { id: string; title: string };
  student?: { id: string; fullName: string; email: string };
}

const EssayDashboard = () => {
  const { lang } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [courseId, setCourseId] = useState("");
  const [selectedQuestionId, setSelectedQuestionId] = useState("");
  const [selectedAnswerId, setSelectedAnswerId] = useState("");
  const [editingQuestionId, setEditingQuestionId] = useState("");
  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewedFilter, setReviewedFilter] = useState("");

  const coursesQuery = useQuery({
    queryKey: ["courses-lite"],
    queryFn: () => apiFetch<{ data: { courses: CourseLite[] } }>("/courses")
  });

  const questionsQuery = useQuery({
    queryKey: ["admin-essay-questions", courseId],
    queryFn: () => apiFetch<{ data: { questions: EssayQuestion[] } }>(`/admin/essay-questions?courseId=${courseId}`),
    enabled: Boolean(courseId)
  });

  const answersQuery = useQuery({
    queryKey: ["admin-essay-answers", courseId, selectedQuestionId, reviewedFilter],
    queryFn: () =>
      apiFetch<{ data: { answers: EssayAnswer[] } }>(
        `/admin/essay-answers?${new URLSearchParams({
          ...(courseId ? { courseId } : {}),
          ...(selectedQuestionId ? { questionId: selectedQuestionId } : {}),
          ...(reviewedFilter ? { reviewed: reviewedFilter } : {})
        }).toString()}`
      )
  });

  const selectedAnswer = useMemo(
    () => answersQuery.data?.data.answers.find((answer) => answer.id === selectedAnswerId) ?? null,
    [answersQuery.data, selectedAnswerId]
  );

  const createMutation = useMutation({
    mutationFn: () =>
      apiFetch(`/courses/${courseId}/essay-questions`, {
        method: "POST",
        body: JSON.stringify({ title, question, description: description || undefined })
      }),
    onSuccess: async () => {
      setTitle("");
      setQuestion("");
      setDescription("");
      await queryClient.invalidateQueries({ queryKey: ["admin-essay-questions", courseId] });
      toast({
        title: lang === "ar" ? "تم إنشاء السؤال ✓" : "השאלה נוצרה ✓",
        description: lang === "ar" ? "السؤال الجديد أضيف بنجاح" : "השאלה החדשה נוספה בהצלחה",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: lang === "ar" ? "حدث خطأ ✗" : "אירעה שגיאה ✗",
        description: (error as Error).message || (lang === "ar" ? "فشل إنشاء السؤال" : "הוספת השאלה נכשלה"),
        variant: "destructive"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      apiFetch(`/courses/${courseId}/essay-questions/${editingQuestionId}`, {
        method: "PATCH",
        body: JSON.stringify({ title, question, description: description || undefined })
      }),
    onSuccess: async () => {
      setEditingQuestionId("");
      setTitle("");
      setQuestion("");
      setDescription("");
      await queryClient.invalidateQueries({ queryKey: ["admin-essay-questions", courseId] });
      toast({
        title: lang === "ar" ? "تم تحديث السؤال ✓" : "השאלה עודכנה ✓",
        description: lang === "ar" ? "تم تحديث السؤال بنجاح" : "השאלה עודכנה בהצלחה",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: lang === "ar" ? "حدث خطأ ✗" : "אירעה שגיאה ✗",
        description: (error as Error).message || (lang === "ar" ? "فشل تحديث السؤال" : "עדכון השאלה נכשל"),
        variant: "destructive"
      });
    }
  });

  const disableMutation = useMutation({
    mutationFn: () => apiFetch(`/courses/${courseId}/essay-questions/${editingQuestionId}`, { method: "DELETE" }),
    onSuccess: async () => {
      setEditingQuestionId("");
      setTitle("");
      setQuestion("");
      setDescription("");
      await queryClient.invalidateQueries({ queryKey: ["admin-essay-questions", courseId] });
      toast({
        title: lang === "ar" ? "تم حذف السؤال ✓" : "השאלה נמחקה ✓",
        description: lang === "ar" ? "تم حذف السؤال بنجاح" : "השאלה נמחקה בהצלחה",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: lang === "ar" ? "حدث خطأ ✗" : "אירעה שגיאה ✗",
        description: (error as Error).message || (lang === "ar" ? "فشل حذف السؤال" : "מחיקת השאלה נכשלה"),
        variant: "destructive"
      });
    }
  });

  const reviewMutation = useMutation({
    mutationFn: () => apiFetch(`/admin/essay-answers/${selectedAnswerId}/reviews`, {
      method: "POST",
      body: JSON.stringify({ notes: reviewNotes })
    }),
    onSuccess: async () => {
      setReviewNotes("");
      await queryClient.invalidateQueries({ queryKey: ["admin-essay-answers"] });
      toast({
        title: lang === "ar" ? "تم إرسال التصحيح ✓" : "הביקורת נשלחה ✓",
        description: lang === "ar" ? "تم إرسال ملاحظاتك للطالب" : "ההערות הישלחו לתלמיד",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: lang === "ar" ? "حدث خطأ ✗" : "אירעה שגיאה ✗",
        description: (error as Error).message || (lang === "ar" ? "فشل إرسال التصحيح" : "שליחת הביקורת נכשלה"),
        variant: "destructive"
      });
    }
  });

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
      <section className="space-y-6">
        <div className="glass-card rounded-2xl p-6">
          <h1 className="text-2xl font-bold mb-4">{lang === "ar" ? "إدارة الأسئلة الإنشائية" : "ניהול שאלות חיבור"}</h1>
          <select value={courseId} onChange={(event) => setCourseId(event.target.value)} className="w-full rounded-xl border border-border bg-background px-4 py-3 mb-4">
            <option value="">{lang === "ar" ? "اختر كورس" : "בחרו קורס"}</option>
            {coursesQuery.data?.data.courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
          </select>

          <button
            type="button"
            onClick={() => {
              setEditingQuestionId("");
              setTitle("");
              setQuestion("");
              setDescription("");
            }}
            className="mb-4 text-sm text-primary font-semibold"
          >
            {lang === "ar" ? "إنشاء سؤال جديد" : "יצירת שאלה חדשה"}
          </button>

          <div className="space-y-3">
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={lang === "ar" ? "عنوان السؤال" : "כותרת השאלה"} className="w-full rounded-xl border border-border bg-background px-4 py-3" />
            <textarea value={question} onChange={(event) => setQuestion(event.target.value)} rows={5} placeholder={lang === "ar" ? "نص السؤال" : "טקסט השאלה"} className="w-full rounded-xl border border-border bg-background px-4 py-3" />
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} placeholder={lang === "ar" ? "وصف اختياري" : "תיאור אופציונלי"} className="w-full rounded-xl border border-border bg-background px-4 py-3" />
            <button
              disabled={(editingQuestionId ? updateMutation.isPending : createMutation.isPending) || !courseId || !title || !question}
              onClick={() => (editingQuestionId ? updateMutation.mutate() : createMutation.mutate())}
              className="w-full rounded-xl gradient-bg py-3 font-semibold text-primary-foreground disabled:opacity-60"
            >
              {editingQuestionId
                ? updateMutation.isPending
                  ? (lang === "ar" ? "جارٍ التحديث..." : "מעדכן...")
                  : (lang === "ar" ? "تحديث السؤال" : "עדכון שאלה")
                : createMutation.isPending
                  ? (lang === "ar" ? "جارٍ الحفظ..." : "שומר...")
                  : (lang === "ar" ? "إضافة سؤال" : "הוספת שאלה")}
            </button>
            {editingQuestionId ? (
              <button
                type="button"
                disabled={disableMutation.isPending}
                onClick={() => disableMutation.mutate()}
                className="w-full rounded-xl border border-destructive/30 bg-destructive/10 py-3 font-semibold text-destructive disabled:opacity-60"
              >
                {disableMutation.isPending ? (lang === "ar" ? "جارٍ التعطيل..." : "מנטרל...") : (lang === "ar" ? "تعطيل السؤال" : "השבתת שאלה")}
              </button>
            ) : null}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">{lang === "ar" ? "أسئلة الكورس" : "שאלות הקורס"}</h2>
          {questionsQuery.data?.data.questions.map((item) => (
            <button
              key={item.id}
                onClick={() => {
                setSelectedQuestionId(item.id);
                setSelectedAnswerId("");
                  setEditingQuestionId(item.id);
                  setTitle(item.title);
                  setQuestion(item.question);
                  setDescription(item.description || "");
              }}
              className="w-full text-start rounded-xl border border-border/60 p-4 mb-3 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{item.question}</p>
                </div>
                <span className={`text-xs rounded-full px-2 py-1 ${item.isActive ? "bg-emerald-500/15 text-emerald-600" : "bg-destructive/15 text-destructive"}`}>{item.isActive ? "Active" : "Inactive"}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-xl font-bold">{lang === "ar" ? "إجابات الطلبة" : "תשובות תלמידים"}</h2>
            <select value={reviewedFilter} onChange={(event) => setReviewedFilter(event.target.value)} className="rounded-xl border border-border bg-background px-4 py-2 text-sm">
              <option value="">All</option>
              <option value="true">Reviewed</option>
              <option value="false">Pending</option>
            </select>
          </div>

          <div className="space-y-3">
            {answersQuery.data?.data.answers.map((answer) => (
              <button
                key={answer.id}
                onClick={() => setSelectedAnswerId(answer.id)}
                className="w-full text-start rounded-xl border border-border/60 p-4 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div>
                    <p className="font-semibold">{answer.student?.fullName || answer.studentId}</p>
                    <p className="text-sm text-muted-foreground">{answer.question?.title || answer.questionId}</p>
                  </div>
                  <span className={`text-xs rounded-full px-2 py-1 ${answer.isReviewed ? "bg-emerald-500/15 text-emerald-600" : "bg-amber-500/15 text-amber-600"}`}>{answer.isReviewed ? "Reviewed" : "Pending"}</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{answer.answerText}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">{lang === "ar" ? "إضافة ملاحظة / تصحيح" : "הוספת הערה / תיקון"}</h2>
          {selectedAnswer ? (
            <>
              <p className="text-sm text-muted-foreground mb-3">{selectedAnswer.student?.fullName} - {selectedAnswer.question?.title}</p>
              <p className="rounded-xl border border-border/60 bg-secondary/30 p-4 mb-4 whitespace-pre-wrap">{selectedAnswer.answerText}</p>
              <textarea value={reviewNotes} onChange={(event) => setReviewNotes(event.target.value)} rows={5} placeholder={lang === "ar" ? "اكتب الملاحظات هنا" : "כתוב/כתבי הערות כאן"} className="w-full rounded-xl border border-border bg-background px-4 py-3 mb-4" />
              <button disabled={reviewMutation.isPending || !reviewNotes} onClick={() => reviewMutation.mutate()} className="w-full rounded-xl gradient-bg py-3 font-semibold text-primary-foreground disabled:opacity-60">
                {reviewMutation.isPending ? (lang === "ar" ? "جارٍ الإرسال..." : "שולח...") : (lang === "ar" ? "إرسال الملاحظة" : "שליחת הערה")}
              </button>
            </>
          ) : (
            <p className="text-muted-foreground">{lang === "ar" ? "اختر إجابة من القائمة" : "בחרו תשובה מהרשימה"}</p>
          )}
        </div>
      </section>
    </motion.div>
  );
};

export default EssayDashboard;