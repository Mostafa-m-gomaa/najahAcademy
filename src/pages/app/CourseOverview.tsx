import { useOutletContext, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import SafeMediaImage from "@/components/SafeMediaImage";

interface ApiCourse {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  topicsCount: number;
  topics: Array<any>;
}

const CourseOverview = () => {
  const { lang } = useLanguage();
  const course = useOutletContext<ApiCourse>();

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
        <div className="glass-card rounded-2xl p-6 md:p-8">
          <h2 className="text-xl font-bold mb-3">
            {lang === "ar" ? "عن الكورس" : "על הקורס"}
          </h2>
          <p className="text-muted-foreground leading-7">{course.description}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <div className="px-4 py-2 rounded-xl bg-secondary/60 text-sm">
              {lang === "ar" ? "عدد المحاضرات المسجلة" : "מספר הרצאות מוקלטות"}: {course.topicsCount}
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden">
          <SafeMediaImage
            src={course.imageUrl}
            alt={course.title}
            wrapperClassName="h-52 bg-secondary/60"
            className="h-full w-full object-cover"
          />
          <div className="p-6">
            <h3 className="font-semibold mb-3">
              {lang === "ar" ? "ابدأ التعلّم" : "התחילו ללמוד"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {lang === "ar"
                ? "المحاضرات المسجلة مرتبة بالترتيب الصحيح للوصول للفيديوهات والملفات."
                : "ההרצאות המוקלטות מסודרות לפי סדר נכון כדי להגיע לסרטונים ולחומרים."}
            </p>
            <Link
              to={`/app/courses/${course.id}/topics`}
              className="inline-flex items-center gap-2 text-primary font-semibold"
            >
              <BookOpen className="w-4 h-4" />
              {lang === "ar" ? "عرض المحاضرات المسجلة" : "הצגת הרצאות מוקלטות"}
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseOverview;
