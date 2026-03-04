import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { courses, Course } from '@/data/courses';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedBackground from '@/components/AnimatedBackground';
import WhatsAppButton from '@/components/WhatsAppButton';
import CourseCard from '@/components/CourseCard';

const validTypes: Course['type'][] = ['solo', 'group', 'enSolo', 'enGroup'];

const getCategoryMeta = (type: Course['type'], lang: 'ar' | 'he') => {
    const map = {
        solo: {
            ar: {
                title: 'دورات العبرية الفردية',
                subtitle: 'خطة تعليمية فردية مرنة تساعدك على التقدم بسرعة وثقة.',
            },
            he: {
                title: 'קורסי עברית פרטניים',
                subtitle: 'תכנית לימוד אישית וגמישה להתקדמות מהירה ובטוחה.',
            },
        },
        group: {
            ar: {
                title: 'دورات العبرية الجماعية',
                subtitle: 'تعلم تفاعلي ضمن مجموعات محفزة مع تركيز قوي على المحادثة.',
            },
            he: {
                title: 'קורסי עברית קבוצתיים',
                subtitle: 'למידה אינטראקטיבית בקבוצה עם דגש חזק על דיבור.',
            },
        },
        enSolo: {
            ar: {
                title: 'دورات الإنجليزية الفردية',
                subtitle: 'مسارات فردية في الإنجليزية من التأسيس حتى الأهداف الأكاديمية.',
            },
            he: {
                title: 'קורסי אנגלית פרטניים',
                subtitle: 'מסלולי אנגלית פרטניים מהיסוד ועד מטרות אקדמיות.',
            },
        },
        enGroup: {
            ar: {
                title: 'دورات الإنجليزية الجماعية',
                subtitle: 'مجموعات إنجليزية عملية للتحضير للبجروت والاختبارات الجامعية.',
            },
            he: {
                title: 'קורסי אנגלית קבוצתיים',
                subtitle: 'קבוצות אנגלית מעשיות להכנה לבגרות ולמבחנים אקדמיים.',
            },
        },
    };

    return map[type][lang];
};

const CourseCategory = () => {
    const { lang } = useLanguage();
    const { category } = useParams<{ category: string }>();
    const type = (category || '') as Course['type'];

    if (!validTypes.includes(type)) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-muted-foreground">Category not found</p>
            </div>
        );
    }

    const categoryCourses = courses.filter((course) => course.type === type);
    const meta = getCategoryMeta(type, lang);

    return (
        <div className="min-h-screen bg-background relative">
            <AnimatedBackground />
            <Navbar />

            <main className="relative z-10 pt-24 pb-16 px-4 md:px-8">
                <div className="container mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-10"
                    >
                        <Link
                            to="/#courses"
                            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5"
                        >
                            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                            {lang === 'ar' ? 'العودة إلى الفئات' : 'חזרה לקטגוריות'}
                        </Link>

                        <div className="glass-card-glow rounded-2xl p-6 md:p-8 border border-primary/15">
                            <h1 className="text-3xl md:text-4xl font-bold mb-3 gradient-text">{meta.title}</h1>
                            <p className="text-muted-foreground text-lg">{meta.subtitle}</p>
                        </div>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 sm:auto-rows-fr gap-6 items-stretch">
                        {categoryCourses.map((course, index) => (
                            <CourseCard key={course.id} course={course} index={index} type={type} />
                        ))}
                    </div>
                </div>
            </main>

            <Footer />
            <WhatsAppButton />
        </div>
    );
};

export default CourseCategory;
