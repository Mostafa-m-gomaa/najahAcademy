import { useParams, Link } from "react-router-dom";
import { useQuery, useQueries } from "@tanstack/react-query";
import { apiFetch, resolveMediaUrl } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";

interface ExamItem {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
}

interface LatestAttemptResponse {
  data?: {
    attempt?: {
      score?: {
        percentage?: number;
      };
      summary?: {
        percentage?: number;
      };
    } | null;
  };
}

const GroupExams = () => {
  const { courseId = "", groupId = "" } = useParams();
  const { lang } = useLanguage();

  const { data, isLoading, error } = useQuery({
    queryKey: ["group-exams", groupId],
    queryFn: () => apiFetch<{ data: { exams: ExamItem[] } }>(`/courses/${courseId}/question-groups/${groupId}/exams`),
    enabled: Boolean(groupId)
  });

  const exams = data?.data.exams || [];

  const latestAttemptQueries = useQueries({
    queries: exams.map((exam) => ({
      queryKey: ["exam-latest", exam.id],
      queryFn: () => apiFetch<LatestAttemptResponse>(`/courses/${courseId}/exams/${exam.id}/my-latest-attempt`),
      enabled: Boolean(courseId && exam.id)
    }))
  });

  const latestScoreByExamId = exams.reduce<Record<string, number | null>>((acc, exam, index) => {
    const attempt = latestAttemptQueries[index]?.data?.data?.attempt;
    const percentage = attempt?.score?.percentage ?? attempt?.summary?.percentage;
    acc[exam.id] = typeof percentage === "number" ? percentage : null;
    return acc;
  }, {});

  return (
    <div>
      {isLoading ? (
        <div className="text-center text-muted-foreground">{lang === "ar" ? "جارٍ التحميل..." : "טוען..."}</div>
      ) : error ? (
        <div className="text-center text-destructive">{(error as Error).message}</div>
      ) : !exams.length ? (
        <div className="glass-card rounded-2xl p-8 text-center text-muted-foreground">{lang === "ar" ? "لا توجد امتحانات" : "אין בחנים"}</div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-6">
          {exams.map((e) => (
            <div key={e.id} className="glass-card rounded-2xl overflow-hidden">
              {e.imageUrl ? <img src={resolveMediaUrl(e.imageUrl)} alt={e.name} className="h-40 w-full object-cover" /> : null}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-lg">{e.name}</h3>
                  {latestScoreByExamId[e.id] != null ? (
                    <span className="shrink-0 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {lang === "ar" ? `آخر محاولة: ${latestScoreByExamId[e.id]}%` : `ניסיון אחרון: ${latestScoreByExamId[e.id]}%`}
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs font-semibold text-muted-foreground">
                      {lang === "ar" ? "لم تمتحن بعد" : "עדיין לא נבחנת"}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{e.description}</p>
                <div className="mt-4 flex gap-3">
                  <Link to={`/app/courses/${courseId}/exams/${e.id}/take`} className="btn btn-primary">
                    {lang === "ar" ? "أداء الامتحان" : "בצע בחינה"}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupExams;
