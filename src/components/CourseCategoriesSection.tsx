import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { courses, Course } from '@/data/courses';
import { ArrowLeft } from 'lucide-react';

type CourseType = Course['type'];

const CourseCategoriesSection = () => {
    const { lang } = useLanguage();

    const categoryCards: Array<{
        id: string;
        type: CourseType;
        titleAr: string;
        titleHe: string;
        subtitleAr: string;
        subtitleHe: string;
    }> = [
            {
                id: 'hebrew-solo',
                type: 'solo',
                titleAr: 'دورات العبرية الفردية',
                titleHe: 'עברית פרטני',
                subtitleAr: `
  أتقن المحادثة واكسر حاجز الخوف مع دورات العبرية الفردية. برامجنا مخصصة لكافة الأجيال والمستويات، ومصممة لتناسب جدولك وأهدافك الأكاديمية والمهنية بكل خصوصية`,
                subtitleHe: 'מסלולים פרטניים (1:1) עם תכנית לימוד מותאמת לרמה ולמטרות שלכם.',
            },
            {
                id: 'hebrew-group',
                type: 'group',
                titleAr: `دورات العبرية الجماعية
 تفاعل وبراعة`,
                titleHe: 'עברית קבוצתי',
                subtitleAr: `تعلّم بأسلوب تشاركي وتفاعلي لسد الفجوات اللغوية وتحقيق أهدافك؛ سواء كانت للتواصل في الحياة اليومية أو للتفوق في البجروت وياعيل. دوراتنا الجماعية مصممة لكل فئة لتمنحك المعرفة اللازمة مع نخبة من الأكاديميات في بيئة تحفزك على التعاون والتميز.`,
                subtitleHe: 'קורסים קבוצתיים אינטראקטיביים בדגש על דיבור ובניית ביטחון.',
            },
            {
                id: 'english-solo',
                type: 'enSolo',
                titleAr: `دورات الإنجليزية الفردية
بوابتك نحو الطلاقة العالمية`,
                titleHe: 'אנגלית פרטני',
                subtitleAr: 'برامج مكثفة مخصصة لكافة الأجيال والمستويات، تركز على كسر حاجز الخوف والتحضير للامتحانات الرسمية وأهدافك المهنية، تحت إشراف نخبة من الأكاديميات.',
                subtitleHe: 'לימודי אנגלית פרטניים מהיסודות ועד רמת פטור אקדמית.',
            },
            {
                id: 'english-group',
                type: 'enGroup',
                titleAr: 'دورات اللغة الإنجليزية الجماعية',
                titleHe: 'אנגלית קבוצתי',
                subtitleAr: `استمتع بالتعلم الجماعي في بيئة غنية بالتفاعل. دوراتنا مصممة لكافة المستويات لتطوير مهاراتك في الإنجليزية اليومية والأكاديمية، بإشراف نخبة من المعلمات الأكاديميات.`,
                subtitleHe: 'קבוצות אנגלית אקדמיות לבגרות ולמבחני קבלה.',
            },
        ];

    return (
        <section id="courses" className="section-padding relative z-10">
            <div className="container mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-14"
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        {lang === 'ar' ? 'اكتشف حلولنا التعليمية المتكاملة لكل الفئات' : 'בחרו את קטגוריית הקורסים המתאימה לכם'}
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
                        {lang === 'ar'
                            ? 'ابدأ من الفئة التي تناسب هدفك، ثم استعرض جميع الدورات المتاحة داخلها بتفاصيل كاملة.'
                            : 'התחילו מהקטגוריה המתאימה למטרה שלכם וצפו בכל הקורסים הזמינים בה.'}
                    </p>
                </motion.div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                    {categoryCards.map((category, i) => {
                        const previewCourse = courses.find((c) => c.type === category.type);

                        return (
                            <motion.div
                                key={category.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08 }}
                                className="h-full"
                            >
                                <Link to={`/courses/${category.type}`} className="block group h-full">
                                    <div className="glass-card-glow rounded-2xl overflow-hidden h-full flex flex-col border border-primary/10 transition-all duration-300 group-hover:-translate-y-1">
                                        <div className="h-44 relative overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
                                            {previewCourse?.image ? (
                                                <img
                                                    src="https://najah2200.com/images/669ad813acda9dbf495f2f611e97deec.jpg"
                                                    alt={lang === 'ar' ? category.titleAr : category.titleHe}
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            ) : null}
                                        </div>

                                        <div className="p-5 flex flex-col h-full">
                                            <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                                                {lang === 'ar' ? category.titleAr : category.titleHe}
                                            </h3>
                                            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                                                {lang === 'ar' ? category.subtitleAr : category.subtitleHe}
                                            </p>

                                            <span className="mt-auto inline-flex items-center gap-2 text-sm text-primary font-medium bg-primary p-2 rounded-md hover:bg-primary/90 transition-all duration-300 text-white">
                                                {lang === 'ar' ? 'استعرض الدورات' : 'צפו בקורסים'}
                                                <ArrowLeft className="w-4 h-4 rotate-180 rtl:rotate-0" />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default CourseCategoriesSection;
