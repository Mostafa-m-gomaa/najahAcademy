import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Bell } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";

interface NotificationItem {
  id: string;
  type: "essay_answer_reviewed";
  title: string;
  message: string;
  data: { courseId?: string; questionId?: string; answerId?: string };
  isRead: boolean;
  createdAt: string;
}

const Notifications = () => {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => apiFetch<{ data: { notifications: NotificationItem[] } }>("/notifications")
  });

  const markRead = async (notificationId: string) => {
    await apiFetch(`/notifications/${notificationId}/read`, { method: "PATCH" });
    await queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  const handleOpen = async (notification: NotificationItem) => {
    await markRead(notification.id);
    if (notification.type === "essay_answer_reviewed" && notification.data.courseId && notification.data.questionId) {
      navigate(`/app/courses/${notification.data.courseId}/essay-questions/${notification.data.questionId}`);
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground />
      <Navbar />

      <main className="relative z-10 pt-24 pb-16 px-4 md:px-8">
        <div className="container mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary/50 px-4 py-2 text-sm text-muted-foreground mb-4">
              <Bell className="w-4 h-4 text-primary" />
              {lang === "ar" ? "التنبيهات" : "התראות"}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">{lang === "ar" ? "تنبيهاتك" : "ההתראות שלך"}</h1>
          </motion.div>

          {isLoading ? (
            <div className="text-center text-muted-foreground">{lang === "ar" ? "جارٍ التحميل..." : "טוען..."}</div>
          ) : error ? (
            <div className="text-center text-destructive">{(error as Error).message}</div>
          ) : !data?.data.notifications.length ? (
            <div className="glass-card rounded-2xl p-8 text-center text-muted-foreground">
              {lang === "ar" ? "لا توجد تنبيهات حالياً" : "אין התראות כרגע"}
            </div>
          ) : (
            <div className="space-y-4">
              {data.data.notifications.map((notification) => (
                <motion.button
                  key={notification.id}
                  type="button"
                  onClick={() => handleOpen(notification)}
                  whileHover={{ y: -2 }}
                  className={`w-full text-start glass-card rounded-2xl p-5 border transition-all ${notification.isRead ? "border-border/50 opacity-75" : "border-primary/25"}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{notification.title}</h3>
                      <p className="text-muted-foreground leading-7">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-3">{new Date(notification.createdAt).toLocaleString()}</p>
                    </div>
                    <Link
                      to={notification.data.courseId && notification.data.questionId ? `/app/courses/${notification.data.courseId}/essay-questions/${notification.data.questionId}` : "/notifications"}
                      className="shrink-0 rounded-xl bg-secondary/70 px-3 py-2 text-sm font-semibold"
                    >
                      {notification.isRead ? (lang === "ar" ? "مقروء" : "נקרא") : (lang === "ar" ? "افتح" : "פתח")}
                    </Link>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Notifications;