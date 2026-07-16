import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import SafeMediaImage from "@/components/SafeMediaImage";

const QuestionGroups = () => {
  const { courseId = "" } = useParams();
  const { lang } = useLanguage();

  const { data, isLoading, error } = useQuery({
    queryKey: ["question-groups", courseId],
    queryFn: () => apiFetch<{ data: { groups: any[] } }>(`/courses/${courseId}/question-groups`),
    enabled: Boolean(courseId)
  });

  const groups = useMemo(() => {
    const list = data?.data.groups ?? [];
    return [...list].reverse();
  }, [data?.data.groups]);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      {isLoading ? (
        <div className="text-center text-muted-foreground">{lang === "ar" ? "جارٍ التحميل..." : "טוען..."}</div>
      ) : error ? (
        <div className="text-center text-destructive">{(error as Error).message}</div>
      ) : !groups.length ? (
        <div className="glass-card rounded-2xl p-8 text-center text-muted-foreground">{lang === "ar" ? "لا توجد مجموعات أسئلة" : "אין קבוצות שאלות"}</div>
      ) : (
        <div className="flex flex-wrap gap-3 items-start">
          {groups.map((g) => (
            <div
              key={g.id}
              className="glass-card rounded-xl overflow-hidden w-full sm:w-[calc(33.333%-0.5rem)] lg:w-[calc(25%-0.5625rem)]"
            >
              <SafeMediaImage
                src={g.imageUrl}
                alt={g.name}
                className="h-20 w-full object-cover"
              />
              <div className="bg-slate-200/90 px-3 py-2">
                <h3 className="font-semibold text-sm leading-snug text-slate-800">{g.name}</h3>
              </div>
              <div className="p-3">
                {g.description ? (
                  <p className="text-sm text-foreground/80 leading-6">{g.description}</p>
                ) : null}
                <Link
                  to={`/app/courses/${courseId}/question-groups/${g.id}/exams`}
                  className="mt-3 inline-flex items-center justify-center rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
                >
                  {lang === "ar" ? "عرض الامتحانات" : "הצגת בחנים"}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default QuestionGroups;
