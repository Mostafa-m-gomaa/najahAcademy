import { useLanguage } from '@/contexts/LanguageContext';
import { courses } from '@/data/courses';
import CourseCard from './CourseCard';
import { motion } from 'framer-motion';

const CoursesSection = ({ type }: { type: 'solo' | 'group' | 'enSolo' | 'enGroup' }) => {
  const { t } = useLanguage();

  return (
    <section id="courses" className="section-padding relative z-10">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t(`courses.title.${type}`)}</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t(`courses.subtitle.${type}`)}</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.filter((course) => course.type === type).map((course, index) => (
            <CourseCard key={course.id} course={course} index={index} type={type} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;
