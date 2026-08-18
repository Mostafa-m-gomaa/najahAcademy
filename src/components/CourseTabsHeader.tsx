import { Link, NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiFetch } from "@/lib/api";
import { isSpecialQuestionGroup } from "@/lib/questionGroups";
import { cn } from "@/lib/utils";

interface CourseTabsHeaderProps {
  courseTitle: string;
  courseId: string;
}

type QuestionGroup = {
  id: string;
  name: string;
};

type TabItem = {
  to: string;
  label: string;
  end?: boolean;
  isActive?: (pathname: string) => boolean;
};

const CourseTabsHeader = ({ courseTitle, courseId }: CourseTabsHeaderProps) => {
  const { lang } = useLanguage();
  const location = useLocation();
  const isExamTake = /\/exams\/[^/]+\/take/.test(location.pathname);

  const { data: groupsData } = useQuery({
    queryKey: ["question-groups", courseId],
    queryFn: () =>
      apiFetch<{ data: { groups: QuestionGroup[] } }>(`/courses/${courseId}/question-groups`),
    enabled: Boolean(courseId),
  });

  const specialGroups = (groupsData?.data.groups ?? [])
    .filter((group) => isSpecialQuestionGroup(group.name))
    .sort((a, b) => {
      const order = ["الفصول", "الامتحانات"];
      return order.indexOf(a.name.trim()) - order.indexOf(b.name.trim());
    });

  const specialTabs: TabItem[] = specialGroups.map((group) => ({
    to: `/app/courses/${courseId}/question-groups/${group.id}/exams`,
    label: group.name,
    end: true,
  }));

  const questionGroupsPath = `/app/courses/${courseId}/question-groups`;

  const tabs: TabItem[] = [
    {
      to: `/app/courses/${courseId}`,
      label: lang === "ar" ? "نظرة عامة" : "סקירה",
      end: true,
    },
    {
      to: `/app/courses/${courseId}/topics`,
      label: lang === "ar" ? "المحاضرات المسجله" : "הרצאות מוקלטות",
    },
    {
      to: `/app/courses/${courseId}/dictionary`,
      label: lang === "ar" ? "القاموس" : "מילון",
    },
    {
      to: questionGroupsPath,
      label: lang === "ar" ? "مجموعات الأسئلة" : "קבוצות שאלות",
      end: true,
      isActive: (pathname) =>
        pathname === questionGroupsPath || pathname === `${questionGroupsPath}/`,
    },
    ...specialTabs,
    {
      to: `/app/courses/${courseId}/essay-questions`,
      label: lang === "ar" ? "أسئلة إنشائية" : "שאלות חיבור",
    },
  ];

  if (isExamTake) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl p-6 md:p-8 mb-8 border border-white/10 bg-[hsl(222_47%_12%)] shadow-[0_0_40px_-12px_hsl(217_91%_60%/0.35)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, hsl(217 91% 60% / 0.28), transparent 45%), radial-gradient(circle at 80% 70%, hsl(187 85% 53% / 0.22), transparent 40%)",
        }}
      />
      <div className="relative">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Link
              to="/app/courses"
              className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
              {lang === "ar" ? "العودة للدورات" : "חזרה לקורסים"}
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold mt-3 text-white">{courseTitle}</h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-start md:justify-end">
            {tabs.map((tab) => (
              <RouterNavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) => {
                  const active = tab.isActive ? tab.isActive(location.pathname) : isActive;
                  return cn(
                    "px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                    active
                      ? "gradient-bg text-primary-foreground"
                      : "bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
                  );
                }}
              >
                {tab.label}
              </RouterNavLink>
            ))}
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-sm text-white/55"
        >
          {lang === "ar"
            ? "كل محتوى الكورس منظم في تبويبات واضحة. ابدأ بالمحاضرات المسجلة للوصول للفيديوهات والملفات."
            : "כל תוכן הקורס מאורגן בטאבים ברורים. התחילו מההרצאות המוקלטות כדי להגיע לסרטונים ולחומרים."}
        </motion.div>
      </div>
    </div>
  );
};

export default CourseTabsHeader;
