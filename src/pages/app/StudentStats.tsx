import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BarChart3, Bell, BookCheck, BrainCircuit, PenSquare, PieChart as PieChartIcon } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import AnimatedBackground from "@/components/AnimatedBackground";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

type StudentPlatformStatsResponse = {
  success: boolean;
  data: {
    stats: {
      profile: {
        id: string;
        fullName: string;
        email: string;
        joinedAt: string;
      };
      overview: {
        activeSubscriptions: number;
        examsTaken: number;
        totalExamAttempts: number;
        totalQuestionsReviewed: number;
        answeredQuestions: number;
        correctAnswers: number;
        wrongAnswers: number;
        unansweredQuestions: number;
        accuracyPercent: number;
        essayAnswersSubmitted: number;
        essayAnswersReviewed: number;
        aiEssayReviews: number;
        dictionaryFavorites: number;
        unreadNotifications: number;
      };
      subscriptions: {
        byStatus: {
          active: number;
          expired: number;
          canceled: number;
        };
        activeCourses: Array<{
          subscriptionId: string;
          startDate: string;
          endDate: string;
          source: "payment" | "admin";
          course: {
            id: string;
            title: string | null;
            imageUrl: string | null;
          };
        }>;
      };
      activity: {
        examDays: Array<{
          day: string;
          attempts: number;
        }>;
        latestExamResults: Array<{
          examId: string;
          examName: string | null;
          courseId: string;
          courseTitle: string | null;
          score: {
            correctCount: number;
            totalQuestions: number;
            percentage: number;
          };
          submittedAt: string | null;
        }>;
        aiEssayReviewUsageLast7Days: Array<{
          dateKey: string;
          count: number;
        }>;
        todaysAiEssayReviewUsage: number;
        totalNotifications: number;
      };
      generatedAt: string;
    };
  };
};

const formatDate = (value: string | null | undefined, lang: "ar" | "he") => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(lang === "ar" ? "ar-EG" : "he-IL", {
    dateStyle: "medium",
  }).format(date);
};

const StudentStats = () => {
  const { lang } = useLanguage();
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["student-platform-stats"],
    queryFn: () => apiFetch<StudentPlatformStatsResponse>("/auth/me/stats"),
    enabled: user?.role === "student",
  });

  const stats = data?.data.stats;

  const answerDistribution = useMemo(() => {
    if (!stats) return [];
    return [
      {
        key: "correct",
        name: lang === "ar" ? "إجابات صحيحة" : "תשובות נכונות",
        value: stats.overview.correctAnswers,
        color: "#22c55e",
      },
      {
        key: "wrong",
        name: lang === "ar" ? "إجابات خاطئة" : "תשובות שגויות",
        value: stats.overview.wrongAnswers,
        color: "#ef4444",
      },
      {
        key: "unanswered",
        name: lang === "ar" ? "بدون إجابة" : "ללא מענה",
        value: stats.overview.unansweredQuestions,
        color: "#a1a1aa",
      },
    ];
  }, [stats, lang]);

  const subscriptionStatus = useMemo(() => {
    if (!stats) return [];
    return [
      {
        label: lang === "ar" ? "نشط" : "פעיל",
        value: stats.subscriptions.byStatus.active,
      },
      {
        label: lang === "ar" ? "منتهي" : "פג תוקף",
        value: stats.subscriptions.byStatus.expired,
      },
      {
        label: lang === "ar" ? "ملغي" : "בוטל",
        value: stats.subscriptions.byStatus.canceled,
      },
    ];
  }, [stats, lang]);

  const activityDays = useMemo(() => {
    if (!stats) return [];
    return stats.activity.examDays.map((item) => ({
      day: item.day.slice(5),
      attempts: item.attempts,
    }));
  }, [stats]);

  const aiUsageLastWeek = useMemo(() => {
    if (!stats) return [];
    return stats.activity.aiEssayReviewUsageLast7Days.map((item) => ({
      day: item.dateKey.slice(5),
      count: item.count,
    }));
  }, [stats]);

  if (user && user.role !== "student") {
    return (
      <div className="min-h-screen bg-background relative">
        <AnimatedBackground />
        <Navbar />
        <main className="relative z-10 pt-24 pb-16 px-4 md:px-8">
          <div className="container mx-auto text-center text-muted-foreground">
            {lang === "ar" ? "صفحة الإحصائيات متاحة للطلاب فقط." : "דף הסטטיסטיקות זמין לתלמידים בלבד."}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground />
      <Navbar />

      <main className="relative z-10 pt-24 pb-16 px-4 md:px-8">
        <div className="container mx-auto space-y-6">
          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              {lang === "ar" ? "إحصائياتي على المنصة" : "הסטטיסטיקות שלי בפלטפורמה"}
            </h1>
            <p className="text-muted-foreground">
              {stats
                ? (lang === "ar"
                  ? `آخر تحديث: ${formatDate(stats.generatedAt, lang)} - دقة إجمالية ${stats.overview.accuracyPercent}%`
                  : `עודכן לאחרונה: ${formatDate(stats.generatedAt, lang)} - דיוק כולל ${stats.overview.accuracyPercent}%`)
                : (lang === "ar" ? "جارٍ تحميل بيانات الأداء..." : "טוען נתוני ביצועים...")}
            </p>
          </motion.section>

          {isLoading ? (
            <div className="text-center text-muted-foreground">{lang === "ar" ? "جارٍ التحميل..." : "טוען..."}</div>
          ) : error ? (
            <div className="text-center text-destructive">{(error as Error).message}</div>
          ) : stats ? (
            <>
              <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="glass-card rounded-2xl p-5">
                  <p className="text-sm text-muted-foreground mb-2">{lang === "ar" ? "الاشتراكات النشطة" : "מנויים פעילים"}</p>
                  <p className="text-3xl font-bold">{stats.overview.activeSubscriptions}</p>
                </div>
                <div className="glass-card rounded-2xl p-5">
                  <p className="text-sm text-muted-foreground mb-2">{lang === "ar" ? "الامتحانات المأخوذة" : "מבחנים שנלקחו"}</p>
                  <p className="text-3xl font-bold">{stats.overview.examsTaken}</p>
                </div>
                <div className="glass-card rounded-2xl p-5">
                  <p className="text-sm text-muted-foreground mb-2">{lang === "ar" ? "إجابات صحيحة" : "תשובות נכונות"}</p>
                  <p className="text-3xl font-bold">{stats.overview.correctAnswers}</p>
                </div>
                <div className="glass-card rounded-2xl p-5">
                  <p className="text-sm text-muted-foreground mb-2">{lang === "ar" ? "الدقة العامة" : "דיוק כללי"}</p>
                  <p className="text-3xl font-bold gradient-text">{stats.overview.accuracyPercent}%</p>
                </div>
              </section>

              <section className="grid lg:grid-cols-2 gap-6">
                <div className="glass-card rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5" />
                    {lang === "ar" ? "توزيع الإجابات" : "התפלגות תשובות"}
                  </h2>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={answerDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} label>
                          {answerDistribution.map((entry) => (
                            <Cell key={entry.key} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    {lang === "ar" ? "نشاط الامتحانات بالأيام" : "פעילות מבחנים לפי ימים"}
                  </h2>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={activityDays}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                        <XAxis dataKey="day" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="attempts" name={lang === "ar" ? "محاولات" : "ניסיונות"} fill="#0ea5e9" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </section>

              <section className="grid lg:grid-cols-2 gap-6">
                <div className="glass-card rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5" />
                    {lang === "ar" ? "استخدام AI خلال 7 أيام" : "שימוש ב-AI ב-7 ימים אחרונים"}
                  </h2>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={aiUsageLastWeek}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                        <XAxis dataKey="day" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="count"
                          name={lang === "ar" ? "عدد الاستخدام" : "כמות שימוש"}
                          stroke="#8b5cf6"
                          strokeWidth={3}
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <BookCheck className="w-5 h-5" />
                    {lang === "ar" ? "حالة الاشتراكات" : "סטטוס מנויים"}
                  </h2>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={subscriptionStatus} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                        <XAxis type="number" allowDecimals={false} />
                        <YAxis type="category" dataKey="label" width={80} />
                        <Tooltip />
                        <Bar dataKey="value" name={lang === "ar" ? "العدد" : "כמות"} fill="#f59e0b" radius={[0, 8, 8, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </section>

              <section className="grid lg:grid-cols-2 gap-6">
                <div className="glass-card rounded-2xl p-6 space-y-4">
                  <h2 className="text-lg font-semibold">{lang === "ar" ? "الملخص النصي" : "סיכום טקסטואלי"}</h2>
                  <p className="text-muted-foreground leading-7">
                    {lang === "ar"
                      ? `الطالب ${stats.profile.fullName} انضم في ${formatDate(stats.profile.joinedAt, lang)}. شاركت في ${stats.overview.totalExamAttempts} محاولة امتحان عبر ${stats.overview.examsTaken} امتحان مختلف.`
                      : `${stats.profile.fullName} הצטרף בתאריך ${formatDate(stats.profile.joinedAt, lang)}. השתתפת ב-${stats.overview.totalExamAttempts} ניסיונות ב-${stats.overview.examsTaken} מבחנים שונים.`}
                  </p>
                  <p className="text-muted-foreground leading-7">
                    {lang === "ar"
                      ? `قدمت ${stats.overview.essayAnswersSubmitted} إجابة إنشائية، وتمت مراجعة ${stats.overview.essayAnswersReviewed} منها. استخدمت مراجعة الذكاء الاصطناعي ${stats.overview.aiEssayReviews} مرة (اليوم: ${stats.activity.todaysAiEssayReviewUsage}).`
                      : `הגשת ${stats.overview.essayAnswersSubmitted} תשובות חיבור, ומתוכן נבדקו ${stats.overview.essayAnswersReviewed}. השתמשת בבדיקת AI ${stats.overview.aiEssayReviews} פעמים (היום: ${stats.activity.todaysAiEssayReviewUsage}).`}
                  </p>
                  <p className="text-muted-foreground leading-7">
                    {lang === "ar"
                      ? `لديك ${stats.overview.dictionaryFavorites} كلمة مفضلة في القاموس و ${stats.overview.unreadNotifications} إشعار غير مقروء.`
                      : `יש לך ${stats.overview.dictionaryFavorites} מועדפים במילון ו-${stats.overview.unreadNotifications} התראות שלא נקראו.`}
                  </p>
                </div>

                <div className="glass-card rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    {lang === "ar" ? "مؤشرات سريعة" : "מדדים מהירים"}
                  </h2>
                  <div className="space-y-3 text-sm">
                    <div className="rounded-xl border border-border/60 bg-secondary/30 p-4">
                      {lang === "ar" ? "إجابات تم تحليلها:" : "תשובות שנותחו:"}{" "}
                      <span className="font-semibold">{stats.overview.totalQuestionsReviewed}</span>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-secondary/30 p-4">
                      {lang === "ar" ? "أسئلة مُجاب عنها:" : "שאלות שנענו:"}{" "}
                      <span className="font-semibold">{stats.overview.answeredQuestions}</span>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-secondary/30 p-4">
                      {lang === "ar" ? "آخر عدد إشعارات مسجل:" : "סה\"כ התראות שנרשמו:"}{" "}
                      <span className="font-semibold">{stats.activity.totalNotifications}</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="grid lg:grid-cols-2 gap-6">
                <div className="glass-card rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">{lang === "ar" ? "آخر نتائج الامتحانات" : "תוצאות מבחנים אחרונות"}</h2>
                  <div className="space-y-3">
                    {stats.activity.latestExamResults.length ? (
                      stats.activity.latestExamResults.map((item) => (
                        <div key={item.examId} className="rounded-xl border border-border/60 bg-secondary/30 p-4">
                          <p className="font-semibold">{item.examName || (lang === "ar" ? "امتحان بدون اسم" : "מבחן ללא שם")}</p>
                          <p className="text-sm text-muted-foreground">
                            {(lang === "ar" ? "الكورس:" : "קורס:")} {item.courseTitle || (lang === "ar" ? "غير متاح" : "לא זמין")}
                          </p>
                          <p className="text-sm mt-1">
                            {(lang === "ar" ? "النتيجة:" : "ציון:")}{" "}
                            <span className="font-semibold">
                              {item.score.correctCount}/{item.score.totalQuestions} ({item.score.percentage}%)
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {(lang === "ar" ? "تاريخ التسليم:" : "מועד הגשה:")} {formatDate(item.submittedAt, lang)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">{lang === "ar" ? "لا توجد نتائج بعد." : "אין תוצאות עדיין."}</p>
                    )}
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <PenSquare className="w-5 h-5" />
                    {lang === "ar" ? "الاشتراكات النشطة" : "מנויים פעילים"}
                  </h2>
                  <div className="space-y-3">
                    {stats.subscriptions.activeCourses.length ? (
                      stats.subscriptions.activeCourses.map((sub) => (
                        <div key={sub.subscriptionId} className="rounded-xl border border-border/60 bg-secondary/30 p-4">
                          <p className="font-semibold">{sub.course.title || (lang === "ar" ? "كورس غير متاح" : "קורס לא זמין")}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {lang === "ar" ? "من" : "מ-"} {formatDate(sub.startDate, lang)} {lang === "ar" ? "إلى" : "עד"}{" "}
                            {formatDate(sub.endDate, lang)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {lang === "ar" ? "طريقة التفعيل:" : "מקור:"}{" "}
                            {sub.source === "payment" ? (lang === "ar" ? "دفع" : "תשלום") : (lang === "ar" ? "إدارة" : "אדמין")}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">{lang === "ar" ? "لا توجد اشتراكات نشطة." : "אין מנויים פעילים."}</p>
                    )}
                  </div>
                </div>
              </section>
            </>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StudentStats;
