import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { courses } from '@/data/courses';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedBackground from '@/components/AnimatedBackground';
import WhatsAppButton from '@/components/WhatsAppButton';
import { motion } from 'framer-motion';
import { Clock, BarChart3, CheckCircle, ArrowRight } from 'lucide-react';

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { t, lang } = useLanguage();
  const course = courses.find((c) => c.id === id);

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Course not found</p>
      </div>
    );
  }

  const name = lang === 'ar' ? course.nameAr : course.nameHe;
  const fullDesc = lang === 'ar' ? course.fullDescriptionAr : course.fullDescriptionHe;
  const duration = lang === 'ar' ? course.duration : course.durationHe;
  const level = t(`courses.${course.level}`);
  const learningPoints = lang === 'ar' ? course.learningPointsAr : course.learningPointsHe;
  const image = course.image;

  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground />
      <Navbar />

      <main className="relative z-10 pt-24 pb-16 px-4 md:px-8">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="h-56 md:h-72 rounded-3xl overflow-hidden mb-8" style={{ background: 'var(--gradient-hero)' }}>
              <div className="h-full flex items-center justify-center">
                <img src={image} alt={name} className="h-full w-full object-cover" />
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4">{name}</h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">{fullDesc}</p>

            <div className="flex flex-wrap gap-4 mb-8">
              <div className="glass-card rounded-xl px-5 py-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-sm"><strong>{t('courses.duration')}:</strong> {duration}</span>
              </div>
              <div className="glass-card rounded-xl px-5 py-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                <span className="text-sm"><strong>{t('courses.level')}:</strong> {level}</span>
              </div>
              <div className="glass-card rounded-xl px-5 py-3">
                <span className="text-sm"><strong>{t('courses.price')}:</strong>{' '}
                  <span className="gradient-text font-bold text-lg">{course.price} {t('courses.currency')}</span>
                </span>
              </div>
            </div>
          </motion.div>

          {/* What you'll learn */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-6 md:p-8 mb-8"
          >
            <h2 className="text-xl font-bold mb-6">{t('courses.whatYouLearn')}</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {learningPoints.map((point, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground text-sm">{point}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Schedule & flexibility */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card-glow rounded-2xl p-6 md:p-8 mb-8 border border-primary/20"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-bold gradient-text">نظام المواعيد والمرونة:</h2>
            </div>

            <p className="text-muted-foreground leading-8 text-base md:text-lg">
              نعتمد في دوراتنا الفردية مبدأ المرونة لتتناسب مع أوقات طلابنا؛ حيث يتم تنسيق مواعيد اللقاءات بالتواصل المباشر بين الطالب والمعلمة المسؤولة. التعليم متاح في كافة أيام الأسبوع باستثناء يوم السبت، مع إمكانية جدولة الحصص في أي وقت ضمن الفترة ما بين الساعة 8:00 صباحاً و 8:00 مساءً.
            </p>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <Link
              to={`/register?course=${course.id}`}
              className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-semibold gradient-bg text-primary-foreground hover:opacity-90 transition-all text-lg hover:scale-[1.02]"
            >
              {t('courses.registerCourse')}
              <ArrowRight className="w-5 h-5 rotate-180 rtl:rotate-0" />
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default CourseDetail;
