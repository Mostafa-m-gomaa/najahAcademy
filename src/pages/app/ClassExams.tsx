import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatAttemptDate, type ClassExamListItem } from "@/lib/classExams";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

type ClassExamsResponse = {
  data: {
    classExams: ClassExamListItem[];
  };
};

const ClassExams = () => {
  const { courseId = "" } = useParams();
  const { lang } = useLanguage();

  const { data, isLoading, error } = useQuery({
    queryKey: ["class-exams", courseId],
    queryFn: () => apiFetch<ClassExamsResponse>(`/courses/${courseId}/class-exams`),
    enabled: Boolean(courseId),
  });

  const exams = data?.data.classExams ?? [];

  if (isLoading) {
    return (
      <div className="text-center text-muted-foreground">
        {lang === "ar" ? "جارٍ التحميل..." : "טוען..."}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-destructive">{(error as Error).message}</div>
    );
  }

  if (!exams.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-8 text-center text-muted-foreground"
      >
        {lang === "ar" ? "لا توجد امتحانات" : "אין בחינות"}
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className="glass-card rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">
                {lang === "ar" ? "اسم الامتحان" : "שם הבחינה"}
              </TableHead>
              <TableHead className="text-right">
                {lang === "ar" ? "آخر حل" : "פתרון אחרון"}
              </TableHead>
              <TableHead className="text-center w-[140px]">
                {lang === "ar" ? "الإحصائيات" : "סטטיסטיקה"}
              </TableHead>
              <TableHead className="text-center w-[140px]">
                {lang === "ar" ? "الإجراء" : "פעולה"}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exams.map((exam) => (
              <TableRow key={exam.id}>
                <TableCell className="text-right font-semibold">{exam.name}</TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {exam.hasAttempted ? (
                    <span>
                      {formatAttemptDate(exam.lastAttemptAt, lang)}
                      {exam.lastScore != null ? (
                        <span className="ms-2 text-emerald-700 font-medium">
                          ({exam.lastScore.percentage}%)
                        </span>
                      ) : null}
                    </span>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {exam.hasAttempted ? (
                    <Button
                      asChild
                      size="sm"
                      variant="secondary"
                      className="rounded-xl"
                    >
                      <Link to="/app/stats">
                        {lang === "ar" ? "الاحصائيات" : "סטטיסטיקה"}
                      </Link>
                    </Button>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    asChild
                    size="sm"
                    className="rounded-xl gradient-bg text-primary-foreground hover:text-primary-foreground"
                  >
                    <Link to={`/app/courses/${courseId}/class-exams/${exam.id}/take`}>
                      {exam.hasAttempted
                        ? lang === "ar"
                          ? "اعد الحل"
                          : "פתור שוב"
                        : lang === "ar"
                          ? "ابدأ"
                          : "התחל"}
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
};

export default ClassExams;
