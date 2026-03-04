import { useLanguage } from '@/contexts/LanguageContext';
import { AnimatePresence, motion } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface Testimonial {
  nameAr: string;
  nameHe: string;
  textAr: string;
  textHe: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    nameAr: 'رنين خ',
    nameHe: 'רנין ח',
    textAr: `يعطيك العافية
بصراحة بدي اتشكر مركز النجاح ع اختياره مثل هيك معلمة زي ابتهاج
صرت بالدرس ال 12 وبعده الحماس موجود إني أكمل بالدورة
مع إني ما تخيلت أقدر أحب العبري
بس الحمدلله البرنامج التعليمي معمول بطريقة ممتازة
جد يعطيكو ألف عافية، يارب بارك الله فيكم`,
    textHe: `יישר כוח.
באמת רציתי להודות למרכז נג'אח על הבחירה במורה כמו אבתיהאג'.
הגעתי לשיעור ה-12 ועדיין יש לי מוטיבציה להמשיך בקורס.
לא דמיינתי שאוכל לאהוב עברית,
אבל الحمد لله התוכנית הלימודית בנויה בצורה מצוינת.
אלף תודה, שאלוהים יברך אתכם.`,
    rating: 5,
  },
  {
    nameAr: 'هلال س',
    nameHe: 'הילאל ס',
    textAr: `يسعد صباحكم 🌹
أتقدم بالشكر الجزيل للأكاديميه على اقامه مساق تعلم اللغة العبريه، لقد كانت تجربة رائعة مع كل التخوفات التي كانت قبل البدء بالمساق.
وشكر كبير للمعلمه احلام على المرافقه المهنيه لدروس اللغة العبريه، كانت تجربه اكثر من رائعه والتي بها كسرت حاجز الخوف من التحدث بالعبري واكتسبت الثقه بالنفس واكيد استفدت من هاي اللقاءات.`,
    textHe: `בוקר טוב 🌹
אני מבקשת להודות מכל הלב לאקדמיה על פתיחת מסלול ללימוד עברית. זו הייתה חוויה נהדרת, למרות כל החששות שהיו לי לפני תחילת המסלול.
תודה גדולה למורה אחלאם על הליווי המקצועי בשיעורי העברית. זו הייתה חוויה יוצאת מן הכלל, שבזכותה שברתי את מחסום הפחד לדבר עברית, רכשתי ביטחון עצמי ובוודאות הרווחתי הרבה מהמפגשים האלה.`,
    rating: 5,
  },
  {
    nameAr: 'وعد ت',
    nameHe: 'ועד ת',
    textAr: `مرحبا
انا كثير مبسوطه من الكورس
عنجد عم اطلع بسووطه
ومعلمه رنين تشرح من كل قلبها
وهي تفهم شو انا بدي وشو اغلاطي وهيك عنجد
بتجنن
كثير عم أستفيد
الحمدلله كثير مبسوطه ❤️`,
    textHe: `היי,
אני מאוד מרוצה מהקורס.
באמת אני מרגישה שיפור גדול.
המורה רנין מלמדת מכל הלב,
ומבינה מה אני צריכה ומה הטעויות שלי.
באמת מדהימה.
אני לומדת ומרוויחה הרבה.
ברוך השם אני מאוד שמחה ❤️`,
    rating: 5,
  },
  {
    nameAr: 'هناء ع',
    nameHe: 'הנאא ע',
    textAr: `انا حبيت اشكرك جدا على مصداقيتك ...
المعلمة جدا معطاءة بتعلم باسلوب يذوت اللغة عند الطالب ، بتحفز الطالب وبتختار مواضيع وتمارين بتقوي الهدف المطلوب ...
جد يعطيكم العافية و شكرا كتير الكم 🌹`,
    textHe: `רציתי להודות לכם מאוד על האמינות שלכם...
המורה מאוד נותנת מעצמה, מלמדת בסגנון שמטמיע את השפה אצל התלמיד, מעודדת את התלמיד ובוחרת נושאים ותרגילים שמחזקים את המטרה הנדרשת...
יישר כוח ותודה רבה לכם 🌹`,
    rating: 4,
  },
  {
    nameAr: 'راني ع',
    nameHe: 'ראני ע',
    textAr: `سلام يعطيك العافيه
انا مبارح خلصت تعليم وكان كل اشي تمام الحمدلله
التعليم كان بجنن واستفدت كثير منيح
خاصتن مع لمعلمة ام نسيم معلمة محترمه كثير وشاطره بتعليم وبتفهم الطالب وبتعرف كيف تفوت الحومر على راس الطالب .
شكراً`,
    textHe: `שלום, יישר כוח.
אתמול סיימתי את הלמידה והכול היה מצוין, الحمد لله.
הלימוד היה מדהים והפקתי המון תועלת.
במיוחד עם המורה אום נסים — מורה מכובדת ומאוד מקצועית, מבינה את התלמיד ויודעת איך להעביר את החומר בצורה מצוינת.
תודה.`,
    rating: 4,
  },
  {
    nameAr: 'آلاء س',
    nameHe: 'אלאא ס',
    textAr: `مرحبًا، أنا الاء.
اليوم كان عندي الدرس الأخير في اللغة العبرية مع المعلمة فايزة. أنا سعيدة جدًا وقد تحسّن مستواي كثيرًا في اللغة العبرية. أشكر فايزة جزيل الشكر على صبرها، فهي معلمة ممتازة تعطي من قلبها، وقد استمتعت جدًا معها.

كما أشكركم لأنكم تمنحوننا الفرص من خلال هذه الدروس لنتقدم في اللغة العبرية.

شكرًا لكم ولفايزة من القلب ❤️`,
    textHe: `שלום, אני עלאא.
היום היה לי השיעור האחרון בעברית עם המורה פאייזה. אני מאוד שמחה, והרמה שלי בעברית השתפרה מאוד. תודה רבה לפאייזה על הסבלנות שלה — היא מורה מצוינת שמלמדת מכל הלב, ומאוד נהניתי ללמוד איתה.

וגם תודה לכם שאתם נותנים לנו הזדמנויות דרך השיעורים האלה להתקדם בעברית.

תודה לכם ולפאייזה מכל הלב ❤️`,
    rating: 4,
  },
];

const TestimonialsSection = () => {
  const { t, lang } = useLanguage();
  const [active, setActive] = useState(0);
  const activeItem = testimonials[active];

  const nextSlide = () => {
    setActive((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section id="testimonials" className="section-padding relative z-10">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('testimonials.title')}</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t('testimonials.subtitle')}</p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(_, info) => {
                  if (info.offset.x > 80) prevSlide();
                  if (info.offset.x < -80) nextSlide();
                }}
                className="glass-card-glow rounded-2xl p-6 md:p-8 transition-all ring-2 ring-primary/30 glow min-h-[280px]"
              >
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star
                      key={si}
                      className={`w-4 h-4 ${si < activeItem.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted'}`}
                    />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 leading-relaxed whitespace-pre-line">
                  "{lang === 'ar' ? activeItem.textAr : activeItem.textHe}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">
                      {(lang === 'ar' ? activeItem.nameAr : activeItem.nameHe).charAt(0)}
                    </span>
                  </div>
                  <span className="font-semibold text-sm">{lang === 'ar' ? activeItem.nameAr : activeItem.nameHe}</span>
                </div>
              </motion.div>
            </AnimatePresence>

            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous testimonial"
              className="absolute top-1/2 -translate-y-1/2 -left-4 md:-left-6 w-10 h-10 rounded-full glass-card flex items-center justify-center hover:scale-105 transition-transform"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next testimonial"
              className="absolute top-1/2 -translate-y-1/2 -right-4 md:-right-6 w-10 h-10 rounded-full glass-card flex items-center justify-center hover:scale-105 transition-transform"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-center gap-2 mt-6">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Go to testimonial ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${active === i ? 'w-8 bg-primary' : 'w-2 bg-primary/35 hover:bg-primary/60'}`}
                />
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <a
                href="https://www.instagram.com/stories/highlights/17949197599669882/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold gradient-bg text-primary-foreground hover:opacity-90 transition-all hover:scale-[1.02]"
              >
                للمزيد من آراء الطلاب
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
