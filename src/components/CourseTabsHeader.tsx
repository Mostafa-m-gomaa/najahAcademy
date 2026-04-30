import { Link, NavLink as RouterNavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface CourseTabsHeaderProps {
  courseTitle: string;
  courseId: string;
}

const CourseTabsHeader = ({ courseTitle, courseId }: CourseTabsHeaderProps) => {
  const { lang } = useLanguage();

  const tabs = [
    {
      to: `/app/courses/${courseId}`,
      label: lang === "ar" ? "نظرة عامة" : "סקירה"
    },
    {
      to: `/app/courses/${courseId}/topics`,
      label: lang === "ar" ? "التوبيكس" : "נושאים"
    },
    {
      to: `/app/courses/${courseId}/question-groups`,
      label: lang === "ar" ? "المجموعات" : "קבוצות"
    },
    {
      to: `/app/courses/${courseId}/essay-questions`,
      label: lang === "ar" ? "أسئلة إنشائية" : "שאלות חיבור"
    }
  ];

  return (
    <div className="glass-card-glow rounded-2xl p-6 md:p-8 border border-primary/15 mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Link
            to="/app/courses"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            {lang === "ar" ? "العودة للدورات" : "חזרה לקורסים"}
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold mt-3">{courseTitle}</h1>
        </div>
        <div className="flex items-center gap-2">
          {tabs.map((tab) => (
            <RouterNavLink
              key={tab.to}
              to={tab.to}
              end={tab.to.endsWith(courseId)}
              className={({ isActive }) =>
                cn(
                  "px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                  isActive
                    ? "gradient-bg text-primary-foreground"
                    : "bg-secondary/70 text-muted-foreground hover:text-foreground"
                )
              }
            >
              {tab.label}
            </RouterNavLink>
          ))}
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 text-sm text-muted-foreground"
      >
        {lang === "ar"
          ? "كل محتوى الكورس منظم في تبويبات واضحة. ابدأ بالتوبيكس للوصول للمحاضرات والملفات."
          : "כל תוכן הקורס מאורגן בטאבים ברורים. התחילו בנושאים כדי להגיע להרצאות ולחומרים."}
      </motion.div>
    </div>
  );
};

export default CourseTabsHeader;
