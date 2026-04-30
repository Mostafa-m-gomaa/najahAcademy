import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { apiFetch, resolveMediaUrl } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";

const QuestionGroups = () => {
  const { courseId = "" } = useParams();
  const { lang } = useLanguage();

  const { data, isLoading, error } = useQuery({
    queryKey: ["question-groups", courseId],
    queryFn: () => apiFetch<{ data: { groups: any[] } }>(`/courses/${courseId}/question-groups`),
    enabled: Boolean(courseId)
  });

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      {isLoading ? (
        <div className="text-center text-muted-foreground">{lang === "ar" ? "جارٍ التحميل..." : "טוען..."}</div>
      ) : error ? (
        <div className="text-center text-destructive">{(error as Error).message}</div>
      ) : !data?.data.groups.length ? (
        <div className="glass-card rounded-2xl p-8 text-center text-muted-foreground">{lang === "ar" ? "لا توجد مجموعات أسئلة" : "אין קבוצות שאלות"}</div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-6">
          {data.data.groups.map((g) => (
            <div key={g.id} className="glass-card rounded-2xl overflow-hidden">
              {g.imageUrl ? <img src={resolveMediaUrl(g.imageUrl)} alt={g.name} className="h-40 w-full object-cover" /> : null}
              <div className="p-5">
                <h3 className="font-semibold text-lg">{g.name}</h3>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{g.description}</p>
                <Link to={`/app/courses/${courseId}/question-groups/${g.id}/exams`} className="mt-4 inline-flex items-center gap-2 text-primary font-semibold">
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
