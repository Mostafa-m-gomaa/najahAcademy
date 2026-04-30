import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BookOpenCheck } from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { apiFetch, resolveMediaUrl } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";

interface ApiCourse {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  isPublished: boolean;
  topicsCount: number;
}

const CoursesDashboard = () => {
  const { t, lang } = useLanguage();
  const { data, isLoading, error } = useQuery({
    queryKey: ["courses"],
    queryFn: () => apiFetch<{ data: { courses: ApiCourse[] } }>("/courses")
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
                  <div className="h-44 bg-secondary/60 overflow-hidden">
                    {course.imageUrl ? (
                      <img
                        src={resolveMediaUrl(course.imageUrl)}
                        alt={course.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                        {lang === "ar" ? "بدون صورة" : "ללא תמונה"}
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg mb-2 line-clamp-2">{course.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{course.description}</p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <span>
                        {lang === "ar" ? "عدد التوبيكس" : "מספר נושאים"}: {course.topicsCount}
                      </span>
                      <span>
                        {lang === "ar" ? "السعر" : "מחיר"}: {course.price}₪
                      </span>
                    </div>
                    <Link
                      to={`/app/courses/${course.id}`}
                      className="inline-flex items-center gap-2 text-primary font-semibold"
                    >
                      <BookOpenCheck className="w-4 h-4" />
                      {lang === "ar" ? "اختيار الكورس" : "בחירת קורס"}
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
