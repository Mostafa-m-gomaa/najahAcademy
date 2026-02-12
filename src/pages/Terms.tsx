import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedBackground from '@/components/AnimatedBackground';
import WhatsAppButton from '@/components/WhatsAppButton';
import { motion } from 'framer-motion';

const Terms = () => {
  const { t } = useLanguage();

  const sections = [
    { title: t('terms.section1Title'), text: t('terms.section1Text') },
    { title: t('terms.section2Title'), text: t('terms.section2Text') },
    { title: t('terms.section3Title'), text: t('terms.section3Text') },
    { title: t('terms.section4Title'), text: t('terms.section4Text') },
  ];

  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground />
      <Navbar />

      <main className="relative z-10 pt-24 pb-16 px-4 md:px-8">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-6">{t('terms.title')}</h1>
            <p className="text-muted-foreground mb-10 leading-relaxed">{t('terms.intro')}</p>

            <div className="space-y-8">
              {sections.map((section, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card rounded-2xl p-6"
                >
                  <h2 className="text-lg font-bold mb-3">{section.title}</h2>
                  <p className="text-muted-foreground leading-relaxed">{section.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Terms;
