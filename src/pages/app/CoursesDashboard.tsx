import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BookOpenCheck } from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import SafeMediaImage from "@/components/SafeMediaImage";

interface ApiCourse {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  isPublished: boolean;
  topicsCount: number;
}

type MySubscribedCoursesResponse = {
  success: boolean;
  results: number;
  data: {
    courses: ApiCourse[];
  };
};

const CoursesDashboard = () => {
  const { t, lang } = useLanguage();
  const { data, isLoading, error } = useQuery({
    queryKey: ["my-subscribed-courses"],
    queryFn: () => apiFetch<MySubscribedCoursesResponse>("/courses/my-subscribed")
  });

  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground />
      <Navbar />

      <main className="relative z-10 pt-24 pb-16 px-4 md:px-8">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-3">{t("app.coursesTitle")}</h1>
            <p className="text-muted-foreground text-lg">{t("app.coursesSubtitle")}</p>
          </motion.div>

          {isLoading ? (
            <div className="text-center text-muted-foreground">{t("app.loading")}</div>
          ) : error ? (
            <div className="text-center text-destructive">{(error as Error).message}</div>
          ) : (data?.data.courses.length ?? 0) === 0 ? (
            <div className="text-center text-muted-foreground">
              {lang === "ar" ? "لا توجد كورسات مشترَك فيها حاليًا." : "אין קורסים פעילים כרגע."}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data?.data.courses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="glass-card-glow rounded-2xl overflow-hidden border border-primary/10"
                >
                  <SafeMediaImage
                    src={course.imageUrl}
                    alt={course.title}
                    wrapperClassName="h-44 bg-secondary/60 overflow-hidden"
                    className="h-full w-full object-cover"
                  />
                  <div className="bg-slate-200/90 px-5 py-3">
                    <h3 className="font-bold text-lg leading-snug text-slate-800 line-clamp-2">{course.title}</h3>
                  </div>
                  <div className="p-5">
                    <p className="text-sm text-foreground/85 leading-6 mb-4 line-clamp-3">{course.description}</p>
                    <div className="flex items-center text-sm font-medium text-foreground/75 mb-4">
                      <span>
                        {lang === "ar" ? "عدد المحاضرات المسجلة" : "מספר הרצאות מוקלטות"}: {course.topicsCount}
                      </span>
                    </div>
                    <Link
                      to={`/app/courses/${course.id}`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 hover:scale-[1.02]"
                    >
                      <BookOpenCheck className="w-4 h-4" />
                      {lang === "ar" ? "ابدأ الآن" : "התחל עכשיו"}
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CoursesDashboard;
