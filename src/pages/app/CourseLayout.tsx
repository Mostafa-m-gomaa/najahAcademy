import { useParams, Outlet, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import AnimatedBackground from "@/components/AnimatedBackground";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseTabsHeader from "@/components/CourseTabsHeader";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface ApiCourse {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  isPublished: boolean;
  topicsCount: number;
  topics: Array<{
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
    documents: Array<any>;
    lectures: Array<any>;
    createdAt: string;
    updatedAt: string;
  }>;
}

const CourseLayout = () => {
  const { courseId = "" } = useParams();
  const { t } = useLanguage();
  const location = useLocation();
  const isExamTakePage =
    /\/exams\/[^/]+\/take/.test(location.pathname) ||
    /\/class-exams\/[^/]+\/take/.test(location.pathname);
  const { data, isLoading, error } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => apiFetch<{ data: { course: ApiCourse } }>(`/courses/${courseId}`),
    enabled: Boolean(courseId),
  });

  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground />
      <Navbar />

      <main
        className={cn(
          "relative z-10 pt-24 pb-16 md:px-8",
          isExamTakePage ? "px-2" : "px-4"
        )}
      >
        <div className="container mx-auto">
          {isLoading ? (
            <div className="text-center text-muted-foreground">{t("app.loading")}</div>
          ) : error ? (
            <div className="text-center text-destructive">{(error as Error).message}</div>
          ) : data ? (
            <>
              <CourseTabsHeader courseId={courseId} courseTitle={data.data.course.title} />
              <Outlet context={data.data.course} />
            </>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CourseLayout;
