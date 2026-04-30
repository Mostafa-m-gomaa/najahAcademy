import { useOutletContext, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, CheckCircle } from "lucide-react";
import { resolveMediaUrl } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";

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
              {lang === "ar" ? "عدد التوبيكس" : "מספר נושאים"}: {course.topicsCount}
            </div>
            <div className="px-4 py-2 rounded-xl bg-secondary/60 text-sm">
              {lang === "ar" ? "السعر" : "מחיר"}: {course.price}₪
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="h-52 bg-secondary/60">
            {course.imageUrl ? (
              <img
                src={resolveMediaUrl(course.imageUrl)}
                alt={course.title}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          <div className="p-6">
            <h3 className="font-semibold mb-3">
              {lang === "ar" ? "ابدأ التعلّم" : "התחילו ללמוד"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {lang === "ar"
                ? "التوبيكس مرتبة بالترتيب الصحيح للوصول للمحاضرات والملفات." 
                : "הנושאים מסודרים לפי סדר נכון כדי להגיע להרצאות ולחומרים."}
            </p>
            <Link
              to={`/app/courses/${course.id}/topics`}
              className="inline-flex items-center gap-2 text-primary font-semibold"
            >
              <BookOpen className="w-4 h-4" />
              {lang === "ar" ? "عرض التوبيكس" : "הצגת נושאים"}
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-8 glass-card rounded-2xl overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">
                {lang === "ar" ? "الامتحانات" : "בחנים"}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {lang === "ar"
                ? "اختبر نفسك مع الامتحانات التفاعلية واحصل على التغذية الراجعة الفورية"
                : "בחנו את עצמכם עם בחנים אינטראקטיביים וקבלו משוב מיידי"}
            </p>
            <Link
              to={`/app/courses/${course.id}/question-groups`}
              className="inline-flex items-center gap-2 text-primary font-semibold"
            >
              <CheckCircle className="w-4 h-4" />
              {lang === "ar" ? "عرض الامتحانات" : "הצגת בחנים"}
            </Link>
          </div>
          <div className="h-40 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-primary/40" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseOverview;
