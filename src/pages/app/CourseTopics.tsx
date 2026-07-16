import { useOutletContext, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FolderOpen } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import SafeMediaImage from "@/components/SafeMediaImage";

interface TopicItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  documents: Array<any>;
  lectures: Array<any>;
}

interface ApiCourse {
  id: string;
  title: string;
  topics: TopicItem[];
}

const CourseTopics = () => {
  const { lang } = useLanguage();
  const course = useOutletContext<ApiCourse>();

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      {course.topics.length === 0 ? (
        <div className="text-center text-muted-foreground">
          {lang === "ar" ? "لا توجد محاضرات مسجلة متاحة حالياً" : "אין הרצאות מוקלטות זמינות כרגע"}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {course.topics.map((topic, index) => (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="glass-card-glow rounded-2xl overflow-hidden border border-primary/10"
            >
              <SafeMediaImage
                src={topic.imageUrl}
                alt={topic.title}
                wrapperClassName="h-40 bg-secondary/60"
                className="h-full w-full object-cover"
              />
              <div className="p-5">
                <h3 className="font-semibold text-lg mb-2">{topic.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{topic.description}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <span>
                    {lang === "ar" ? "محاضرات" : "הרצאות"}: {topic.lectures.length}
                  </span>
                  <span>
                    {lang === "ar" ? "ملفات" : "קבצים"}: {topic.documents.length}
                  </span>
                </div>
                <Link
                  to={`/app/courses/${course.id}/topics/${topic.id}`}
                  className="inline-flex items-center gap-2 text-primary font-semibold"
                >
                  <FolderOpen className="w-4 h-4" />
                  {lang === "ar" ? "فتح المحاضرة المسجلة" : "פתיחת הרצאה מוקלטת"}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default CourseTopics;
