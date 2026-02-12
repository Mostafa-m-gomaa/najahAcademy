import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
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
    nameAr: 'أحمد محمد',
    nameHe: 'אחמד מוחמד',
    textAr: 'تجربتي مع معهد نجاح 2000 كانت رائعة. تعلمت العبرية بسرعة كبيرة بفضل المعلمين المتميزين والمنهج الحديث.',
    textHe: 'החוויה שלי במכון נג\'אח 2000 הייתה נפלאה. למדתי עברית במהירות בזכות המורים המצוינים.',
    rating: 5,
  },
  {
    nameAr: 'سارة خالد',
    nameHe: 'סארה חאלד',
    textAr: 'أنصح الجميع بالتسجيل في دورات نجاح 2000. المعهد ساعدني في الحصول على وظيفة أحلامي بفضل إتقاني للعبرية.',
    textHe: 'אני ממליצה לכולם להירשם לקורסים של נג\'אח 2000. המכון עזר לי למצוא את עבודת החלומות שלי.',
    rating: 5,
  },
  {
    nameAr: 'محمد علي',
    nameHe: 'מוחמד עלי',
    textAr: 'المعهد الأفضل بدون منازع. المعلمون محترفون والأجواء ممتازة. أنهيت دورة الإنجليزية للأعمال واستفدت كثيراً.',
    textHe: 'המכון הטוב ביותר ללא ספק. המורים מקצועיים והאווירה מצוינת. סיימתי קורס אנגלית עסקית ונהניתי מאוד.',
    rating: 5,
  },
  {
    nameAr: 'ليلى حسن',
    nameHe: 'לילה חסן',
    textAr: 'بدأت من الصفر في العبرية واليوم أتحدث بطلاقة. شكراً نجاح 2000 على هذه التجربة المميزة.',
    textHe: 'התחלתי מאפס בעברית והיום אני מדברת בשטף. תודה נג\'אח 2000 על החוויה המיוחדת.',
    rating: 4,
  },
];

const TestimonialsSection = () => {
  const { t, lang } = useLanguage();
  const [active, setActive] = useState(0);

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

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`glass-card-glow rounded-2xl p-6 cursor-pointer transition-all ${active === i ? 'ring-2 ring-primary/30 glow' : ''}`}
                onClick={() => setActive(i)}
              >
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star
                      key={si}
                      className={`w-4 h-4 ${si < item.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted'}`}
                    />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  "{lang === 'ar' ? item.textAr : item.textHe}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">
                      {(lang === 'ar' ? item.nameAr : item.nameHe).charAt(0)}
                    </span>
                  </div>
                  <span className="font-semibold text-sm">{lang === 'ar' ? item.nameAr : item.nameHe}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
