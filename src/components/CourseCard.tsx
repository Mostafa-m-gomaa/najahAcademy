import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Course } from '@/data/courses';
import { motion } from 'framer-motion';
import { Clock, BarChart3, ArrowLeft } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  index: number;
}

const levelColors = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-blue-100 text-blue-700',
  advanced: 'bg-purple-100 text-purple-700',
};

const CourseCard = ({ course, index }: CourseCardProps) => {
  const { t, lang } = useLanguage();

  const name = lang === 'ar' ? course.nameAr : course.nameHe;
  const description = lang === 'ar' ? course.descriptionAr : course.descriptionHe;
  const levelLabel = t(`courses.${course.level}`);
  const duration = lang === 'ar' ? course.duration : course.durationHe;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link to={`/course/${course.id}`} className="block group">
        <div className="glass-card-glow rounded-2xl overflow-hidden transition-all duration-300 group-hover:scale-[1.02]">
          {/* Image placeholder with gradient */}
          <div className="h-44 relative overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-bold text-primary-foreground/30">{name.charAt(0)}</span>
            </div>
            <div className={`absolute top-3 left-3 px-3 py-1 rounded-lg text-xs font-semibold ${levelColors[course.level]}`}>
              {levelLabel}
            </div>
          </div>

          <div className="p-5">
            <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{name}</h3>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {duration}
                </span>
                <span className="flex items-center gap-1">
                  <BarChart3 className="w-3.5 h-3.5" />
                  {levelLabel}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-bold text-lg gradient-text">
                {course.price} {t('courses.currency')}
              </span>
              <span className="flex items-center gap-1 text-sm text-primary font-medium group-hover:gap-2 transition-all">
                {t('courses.details')}
                <ArrowLeft className="w-4 h-4 rotate-180 rtl:rotate-0" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CourseCard;
