import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, FileText } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import RichHtmlContent from "@/components/RichHtmlContent";

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

const CourseEssayQuestions = () => {
  const { courseId = "" } = useParams();
  const { lang } = useLanguage();

  const { data, isLoading, error } = useQuery({
    queryKey: ["essay-questions", courseId],
    queryFn: () => apiFetch<{ data: { questions: EssayQuestion[] } }>(`/courses/${courseId}/essay-questions`),
    enabled: Boolean(courseId)
  });

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      {isLoading ? (
        <div className="text-center text-muted-foreground">{lang === "ar" ? "جارٍ التحميل..." : "טוען..."}</div>
      ) : error ? (
        <div className="text-center text-destructive">{(error as Error).message}</div>
      ) : !data?.data.questions.length ? (
        <div className="glass-card rounded-2xl p-8 text-center text-muted-foreground">
          {lang === "ar" ? "لا توجد أسئلة إنشائية لهذا الكورس حالياً" : "אין שאלות חיבור לקורס זה כרגע"}
        </div>
      ) : (
        <div className="grid gap-5">
          {data.data.questions.map((question, index) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04 }}
              className="glass-card-glow rounded-2xl p-5 border border-primary/10"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="w-4 h-4 text-primary" />
                    <span>{lang === "ar" ? "سؤال إنشائي" : "שאלת חיבור"}</span>
                  </div>
                  <h3 className="text-xl font-bold">{question.title}</h3>
                  <div className="line-clamp-3">
                    <RichHtmlContent html={question.question} className="text-muted-foreground leading-7" />
                  </div>
                  {question.description ? (
                    <RichHtmlContent html={question.description} className="text-sm text-muted-foreground" />
                  ) : null}
                </div>

                <Link
                  to={`/app/courses/${courseId}/essay-questions/${question.id}`}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold gradient-bg text-primary-foreground hover:opacity-90 transition-opacity self-start"
                >
                  {lang === "ar" ? "فتح السؤال" : "פתיחת שאלה"}
                  <ArrowRight className="w-4 h-4 rotate-180 rtl:rotate-0" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default CourseEssayQuestions;