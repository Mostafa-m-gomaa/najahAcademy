import { useOutletContext, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, PlayCircle } from "lucide-react";
import { resolveMediaUrl } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";

interface DocumentItem {
  id: string;
  title: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: string;
}

interface LectureItem {
  id: string;
  title: string;
  videoName: string;
  videoUrl: string;
}

interface TopicItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  documents: DocumentItem[];
  lectures: LectureItem[];
}

interface ApiCourse {
  topics: TopicItem[];
}

const isYoutube = (url: string) => url.includes("youtube.com") || url.includes("youtu.be");

const buildYoutubeEmbed = (url: string) => {
  const match = url.match(/(v=|be\/)([A-Za-z0-9_-]{6,})/);
  const id = match?.[2];
  return id ? `https://www.youtube.com/embed/${id}` : url;
};

const TopicDetail = () => {
  const { lang } = useLanguage();
  const { topicId } = useParams();
  const course = useOutletContext<ApiCourse>();
  const topic = course.topics.find((item) => item.id === topicId);

  if (!topic) {
    return (
      <div className="text-center text-muted-foreground">
        {lang === "ar" ? "المحاضرة المسجلة غير موجودة" : "ההרצאה המוקלטת לא נמצאה"}
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className="glass-card rounded-2xl p-6 md:p-8 mb-8">
        <h2 className="text-2xl font-bold mb-3">{topic.title}</h2>
        <p className="text-muted-foreground leading-7">{topic.description}</p>
      </div>

      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8">
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 md:p-8">
            <h3 className="text-lg font-semibold mb-4">
              {lang === "ar" ? "المحاضرات" : "הרצאות"}
            </h3>
            {topic.lectures.length === 0 ? (
              <p className="text-muted-foreground">
                {lang === "ar" ? "لا توجد محاضرات بعد" : "אין הרצאות עדיין"}
              </p>
            ) : (
              <div className="space-y-4">
                {topic.lectures.map((lecture) => (
                  <div key={lecture.id} className="border border-border/60 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <PlayCircle className="w-4 h-4 text-primary" />
                      <h4 className="font-semibold">{lecture.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{lecture.videoName}</p>
                    <div className="rounded-xl overflow-hidden bg-black/80">
                      {isYoutube(lecture.videoUrl) ? (
                        <iframe
                          title={lecture.title}
                          src={buildYoutubeEmbed(lecture.videoUrl)}
                          className="w-full h-64"
                          allowFullScreen
                        />
                      ) : (
                        <video controls className="w-full h-64">
                          <source src={resolveMediaUrl(lecture.videoUrl)} />
                        </video>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 md:p-8">
          <h3 className="text-lg font-semibold mb-4">
            {lang === "ar" ? "الملفات" : "קבצים"}
          </h3>
          {topic.documents.length === 0 ? (
            <p className="text-muted-foreground">
              {lang === "ar" ? "لا توجد ملفات بعد" : "אין קבצים עדיין"}
            </p>
          ) : (
            <div className="space-y-3">
              {topic.documents.map((doc) => (
                <a
                  key={doc.id}
                  href={resolveMediaUrl(doc.fileUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 border border-border/60 rounded-xl px-4 py-3 hover:border-primary/40 transition-colors"
                >
                  <FileText className="w-4 h-4 text-primary" />
                  <div>
                    <div className="text-sm font-semibold">{doc.title}</div>
                    <div className="text-xs text-muted-foreground">{doc.fileType}</div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TopicDetail;
