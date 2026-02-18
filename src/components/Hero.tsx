import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Sparkles, Users, Star, BookOpen, Zap, Brain } from 'lucide-react';

const Hero = () => {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center section-padding pt-28 md:pt-32 overflow-hidden">
      {/* Hero gradient glow behind content */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(ellipse, hsl(217 91% 60% / 0.12), hsl(199 89% 48% / 0.06), transparent 70%)',
            filter: 'blur(60px)',
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Side */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="order-1"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/15 mb-6 backdrop-blur-sm"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">{t('hero.trust')}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 flex flex-col items-start gap-4"
            >
              {t('hero.title')}{' '}
              <span className="gradient-text mt-2">{t('hero.titleAccent')}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-lg"
            >
              {t('hero.subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-wrap gap-4 mb-10"
            >
              <Link
                to="/register"
                className="group relative px-8 py-3.5 rounded-xl font-semibold gradient-bg text-primary-foreground hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
              >
                <span className="relative z-10">{t('hero.cta1')}</span>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: 'radial-gradient(circle at center, hsl(217 91% 70% / 0.4), transparent 70%)' }}
                />
              </Link>
              <a
                href="#courses"
                className="group px-8 py-3.5 rounded-xl font-semibold border-2 border-primary/20 text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all relative overflow-hidden"
              >
                <span className="relative z-10">{t('hero.cta2')}</span>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: 'radial-gradient(circle at center, hsl(217 91% 60% / 0.05), transparent 70%)' }}
                />
              </a>
            </motion.div>

            {/* Trust Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.75 }}
              className="flex flex-wrap gap-6"
            >
              {[
                { icon: Users, label: t('hero.students') },
                { icon: Star, label: t('hero.rating') },
                { icon: BookOpen, label: t('hero.courses_count') },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-muted-foreground">
                  <Icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold">{label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Visual Side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="order-2 relative"
          >
            {/* Floating abstract shapes */}
            <motion.div
              className="absolute -top-10 right-10 w-20 h-20 rounded-full opacity-20"
              style={{ background: 'var(--gradient-primary)', filter: 'blur(20px)' }}
              animate={{ y: [-10, 10, -10], scale: [1, 1.2, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute -bottom-8 left-8 w-16 h-16 rounded-full opacity-15"
              style={{ background: 'hsl(var(--neon-cyan))', filter: 'blur(15px)' }}
              animate={{ y: [10, -10, 10], scale: [1, 1.3, 1] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            />

            <div className="relative">
              {/* Main visual card */}
              <div className="glass-card rounded-3xl p-8 md:p-12 relative overflow-hidden group">
                {/* Glowing border effect */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{
                    background: 'linear-gradient(135deg, hsl(217 91% 60% / 0.1), transparent, hsl(199 89% 48% / 0.1))',
                  }}
                />
                <div className="absolute inset-0 opacity-5" style={{ background: 'var(--gradient-hero)' }} />
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-4">
                    <motion.div
                      className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center"
                      animate={{ boxShadow: ['0 0 20px hsl(217 91% 60% / 0.2)', '0 0 40px hsl(217 91% 60% / 0.4)', '0 0 20px hsl(217 91% 60% / 0.2)'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <BookOpen className="w-7 h-7 text-primary-foreground" />
                    </motion.div>
                    <div>
                      <div className="font-bold text-lg">najah2200</div>
                      <div className="text-sm text-muted-foreground">Language Academy</div>
                    </div>
                  </div>

                  {/* Animated loading bars */}
                  <div className="space-y-3">
                    {[100, 75, 50].map((w, i) => (
                      <motion.div
                        key={i}
                        className="h-3 rounded-full bg-primary/10 overflow-hidden"
                        style={{ width: `${w}%` }}
                      >
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: 'var(--gradient-primary)' }}
                          initial={{ width: '0%' }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 2, delay: 1 + i * 0.3, ease: 'easeOut' }}
                        />
                      </motion.div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <motion.div
                      className="glass-card rounded-xl p-4 text-center group/card hover:shadow-[0_0_30px_hsl(217_91%_60%/0.15)] transition-shadow duration-500"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="text-2xl font-bold gradient-text">א</div>
                      <div className="text-xs text-muted-foreground mt-1">עברית</div>
                    </motion.div>
                    <motion.div
                      className="glass-card rounded-xl p-4 text-center hover:shadow-[0_0_30px_hsl(199_89%_48%/0.15)] transition-shadow duration-500"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="text-2xl font-bold gradient-text">A</div>
                      <div className="text-xs text-muted-foreground mt-1">English</div>
                    </motion.div>
                  </div>

                  <div className="flex gap-2">
                    <motion.div
                      className="h-2 rounded-full flex-1"
                      style={{ background: 'var(--gradient-primary)' }}
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <div className="h-2 rounded-full bg-primary/20 w-1/3" />
                  </div>
                </div>
              </div>

              {/* Floating elements with glow */}
              <motion.div
                animate={{ y: [-8, 8, -8] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 -left-4 glass-card rounded-2xl p-3"
                style={{ boxShadow: '0 0 30px hsl(217 91% 60% / 0.15)' }}
              >
                <Zap className="w-5 h-5 text-primary" />
              </motion.div>

              <motion.div
                animate={{ y: [6, -6, 6] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute -bottom-4 -right-4 glass-card rounded-2xl px-4 py-2"
                style={{ boxShadow: '0 0 30px hsl(199 89% 48% / 0.15)' }}
              >
                <span className="text-sm font-semibold gradient-text">+823</span>
              </motion.div>

              <motion.div
                animate={{ y: [-5, 5, -5], x: [3, -3, 3] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                className="absolute top-1/2 -right-6 glass-card rounded-2xl p-2.5"
                style={{ boxShadow: '0 0 25px hsl(187 85% 53% / 0.15)' }}
              >
                <Brain className="w-4 h-4 text-accent" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
