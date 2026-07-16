import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueries } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import SafeMediaImage from "@/components/SafeMediaImage";

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

  const exams = useMemo(() => {
    const list = data?.data.exams || [];
    return [...list].reverse();
  }, [data?.data.exams]);

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
        <div className="flex flex-wrap gap-3 items-start">
          {exams.map((e) => (
            <div
              key={e.id}
              className="glass-card rounded-xl overflow-hidden w-full sm:w-[calc(33.333%-0.5rem)] lg:w-[calc(25%-0.5625rem)]"
            >
              <SafeMediaImage
                src={e.imageUrl}
                alt={e.name}
                className="h-20 w-full object-cover"
              />
              <div className="bg-slate-200/90 px-3 py-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm leading-snug text-slate-800">{e.name}</h3>
                  {latestScoreByExamId[e.id] != null ? (
                    <span className="shrink-0 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      {lang === "ar" ? `${latestScoreByExamId[e.id]}%` : `${latestScoreByExamId[e.id]}%`}
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full border border-border bg-white/70 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      {lang === "ar" ? "لم تمتحن" : "לא נבחן"}
                    </span>
                  )}
                </div>
              </div>
              <div className="p-3">
                {e.description ? (
                  <p className="text-sm text-foreground/80 leading-6">{e.description}</p>
                ) : null}
                <Link
                  to={`/app/courses/${courseId}/exams/${e.id}/take`}
                  className="mt-3 inline-flex items-center justify-center rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
                >
                  {lang === "ar" ? "أداء الامتحان" : "בצע בחינה"}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupExams;
