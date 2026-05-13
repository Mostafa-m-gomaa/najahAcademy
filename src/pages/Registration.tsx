import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedBackground from '@/components/AnimatedBackground';
import WhatsAppButton from '@/components/WhatsAppButton';
import { motion } from 'framer-motion';
import { CheckCircle, Send } from 'lucide-react';
import { apiFetch } from '@/lib/api';

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xnjgwzpy';

interface ApiCourseLite {
  id: string;
  title: string;
  description: string;
  price: number;
  isPublished: boolean;
}

interface ApiCourse {
  id: string;
  title: string;
  description: string;
  price: number;
  isPublished: boolean;
}

type CoursesResponse = {
  success: boolean;
  results: number;
  data: {
    courses: ApiCourseLite[];
  };
};

type CourseResponse = {
  success: boolean;
  data: {
    course: ApiCourse;
  };
};

const Registration = ({ courseId }: { courseId?: string }) => {
  const { t, lang } = useLanguage();
  const [searchParams] = useSearchParams();
  const preselectedCourse = courseId || searchParams.get('course') || '';

  const selectedCourseQuery = useQuery({
    queryKey: ['course-public', preselectedCourse],
    queryFn: () => apiFetch<CourseResponse>(`/courses/${preselectedCourse}`),
    enabled: Boolean(preselectedCourse),
  });

  const coursesQuery = useQuery({
    queryKey: ['courses-public-lite'],
    queryFn: () => apiFetch<CoursesResponse>(`/courses`),
    enabled: !preselectedCourse,
  });

  const courseOptions = coursesQuery.data?.data.courses ?? [];

  const [form, setForm] = useState({
    name: '',
    city: '',
    phone: '',
    course: preselectedCourse,
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'required';
    if (!form.city.trim()) e.city = 'required';
    if (!form.phone.trim()) e.phone = 'required';
    if (!form.course) e.course = 'required';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    const v = validate();
    if (Object.keys(v).length > 0) {
      setErrors(v);
      return;
    }

    if (!FORMSPREE_ENDPOINT) {
      setSubmitError('Form endpoint is missing. Please configure VITE_FORMSPREE_ENDPOINT.');
      return;
    }

    try {
      setIsSubmitting(true);

      const courseName = preselectedCourse
        ? (selectedCourseQuery.data?.data.course.title || form.course)
        : (courseOptions.find((c) => c.id === form.course)?.title || form.course);

      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          city: form.city,
          phone: form.phone,
          courseId: form.course,
          courseName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      setSubmitted(true);
    } catch {
      setSubmitError(lang === 'ar'
        ? 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.'
        : 'אירעה שגיאה בשליחת הטופס. נסו שוב.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground />
      <Navbar />

      <main className="relative z-10 pt-24 pb-16 px-4 md:px-8">
        <div className="container mx-auto max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-3">{t('register.title')}</h1>
            <p className="text-muted-foreground text-lg">{t('register.subtitle')}</p>
          </motion.div>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-2xl p-8 text-center"
            >
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-semibold">{t('register.success')}</p>
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onSubmit={handleSubmit}
              className="glass-card rounded-2xl p-6 md:p-8 space-y-5"
            >
              <div>
                <label className="block text-sm font-medium mb-2">{t('register.name')}</label>
                <input
                  type="text"
                  maxLength={100}
                  value={form.name}
                  onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: '' }); }}
                  className={`w-full px-4 py-3 rounded-xl bg-secondary/50 border ${errors.name ? 'border-destructive' : 'border-border'} focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all text-sm`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('register.city')}</label>
                <input
                  type="text"
                  maxLength={100}
                  value={form.city}
                  onChange={(e) => { setForm({ ...form, city: e.target.value }); setErrors({ ...errors, city: '' }); }}
                  className={`w-full px-4 py-3 rounded-xl bg-secondary/50 border ${errors.city ? 'border-destructive' : 'border-border'} focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all text-sm`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('register.phone')}</label>
                <input
                  type="tel"
                  maxLength={20}
                  value={form.phone}
                  onChange={(e) => { setForm({ ...form, phone: e.target.value }); setErrors({ ...errors, phone: '' }); }}
                  className={`w-full px-4 py-3 rounded-xl bg-secondary/50 border ${errors.phone ? 'border-destructive' : 'border-border'} focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all text-sm`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('register.course')}</label>
                {preselectedCourse ? (
                  <input
                    type="text"
                    readOnly
                    value={
                      selectedCourseQuery.isLoading
                        ? (lang === 'ar' ? 'جارٍ تحميل الكورس...' : 'טוען קורס...')
                        : (selectedCourseQuery.data?.data.course.title || preselectedCourse)
                    }
                    className={`w-full px-4 py-3 rounded-xl bg-secondary/50 border ${errors.course ? 'border-destructive' : 'border-border'} outline-none transition-all text-sm`}
                  />
                ) : (
                  <select
                    value={form.course}
                    onChange={(e) => { setForm({ ...form, course: e.target.value }); setErrors({ ...errors, course: '' }); }}
                    className={`w-full px-4 py-3 rounded-xl bg-secondary/50 border ${errors.course ? 'border-destructive' : 'border-border'} focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all text-sm`}
                    disabled={coursesQuery.isLoading || Boolean(coursesQuery.error)}
                  >
                    <option value="">{t('register.selectCourse')}</option>
                    {courseOptions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3.5 rounded-xl font-semibold gradient-bg text-primary-foreground hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                {isSubmitting
                  ? (lang === 'ar' ? 'جارٍ الإرسال...' : 'שולח...')
                  : t('register.submit')}
              </button>
              {submitError ? (
                <p className="text-sm text-destructive text-center">{submitError}</p>
              ) : null}
            </motion.form>
          )}
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Registration;
