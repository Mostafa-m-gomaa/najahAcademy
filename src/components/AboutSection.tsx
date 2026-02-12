import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { GraduationCap, BookOpen, Award, Monitor } from 'lucide-react';

const AboutSection = () => {
  const { t } = useLanguage();

  const reasons = [
    { icon: GraduationCap, title: t('about.reason1'), text: t('about.reason1Text') },
    { icon: BookOpen, title: t('about.reason2'), text: t('about.reason2Text') },
    { icon: Award, title: t('about.reason3'), text: t('about.reason3Text') },
    { icon: Monitor, title: t('about.reason4'), text: t('about.reason4Text') },
  ];

  return (
    <section id="about" className="section-padding relative z-10">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('about.title')}</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t('about.subtitle')}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-start mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">{t('about.story')}</p>

            <div className="space-y-6">
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-2 gradient-text">{t('about.mission')}</h3>
                <p className="text-muted-foreground">{t('about.missionText')}</p>
              </div>
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-2 gradient-text">{t('about.vision')}</h3>
                <p className="text-muted-foreground">{t('about.visionText')}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="font-bold text-xl mb-6">{t('about.why')}</h3>
            <div className="grid gap-4">
              {reasons.map(({ icon: Icon, title, text }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card-glow rounded-xl p-5 flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{title}</h4>
                    <p className="text-sm text-muted-foreground">{text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
